"use client";

import { useWalletAccountTransactionSendingSigner } from '@solana/react';
import {
  address,
  Address,
  appendTransactionMessageInstruction,
  assertIsTransactionMessageWithSingleSendingSigner,
  createTransactionMessage,
  getBase58Decoder,
  lamports,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signAndSendTransactionMessageWithSigners,
  TransactionSigner,
} from '@solana/web3.js';
import { getTransferSolInstruction } from '@solana-program/system';
import { getUiWalletAccountStorageKey, type UiWalletAccount, useWallets } from '@wallet-standard/react';
import type { SyntheticEvent } from 'react';
import { useId, useMemo, useRef, useState } from 'react';
import { useSWRConfig } from 'swr';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChain, useRpc } from '@/wallet-ui/solana-react';
import { ErrorDialog, WalletMenuItemContent } from '@/wallet-ui/solana-shadcn';

type Props = Readonly<{
  account: UiWalletAccount;
}>;

function solStringToLamports(solQuantityString: string) {
  if (Number.isNaN(parseFloat(solQuantityString))) {
    throw new Error('Could not parse token quantity: ' + String(solQuantityString));
  }
  const numDecimals = BigInt(solQuantityString.split('.')[1]?.length ?? 0);
  const bigIntLamports = BigInt(solQuantityString.replace('.', '')) * BigInt(10) ** (BigInt(9) - numDecimals);
  return lamports(bigIntLamports);
}

export function SolanaSignAndSendTransactionFeaturePanel({account}: Props) {
  const {mutate} = useSWRConfig();
  const {current: NO_ERROR} = useRef(Symbol());
  const {rpc} = useRpc()
  const wallets = useWallets();
  const [isSendingTransaction, setIsSendingTransaction] = useState(false);
  const [error, setError] = useState<symbol | Error>(NO_ERROR);
  const [lastSignature, setLastSignature] = useState<Uint8Array | undefined>();
  const [solQuantityString, setSolQuantityString] = useState<string>('');
  const [recipientAccountStorageKey, setRecipientAccountStorageKey] = useState<string | undefined>();
  const recipientAccount = useMemo(() => {
    if (recipientAccountStorageKey) {
      for (const wallet of wallets) {
        for (const account of wallet.accounts) {
          if (getUiWalletAccountStorageKey(account) === recipientAccountStorageKey) {
            return account;
          }
        }
      }
    }
  }, [recipientAccountStorageKey, wallets]);
  const {chain: currentChain, solanaExplorerClusterName} = useChain()
  const transactionSendingSigner = useWalletAccountTransactionSendingSigner(account, currentChain);
  const lamportsInputId = useId();
  const recipientSelectId = useId();

  return (
    <div className="w-full">
      <form
        className="flex flex-col sm:flex-row gap-2"
        onSubmit={async e => {
          e.preventDefault();
          setError(NO_ERROR);
          setIsSendingTransaction(true);
          try {
            const amount = solStringToLamports(solQuantityString);
            if (!recipientAccount) {
              throw new Error('The address of the recipient could not be found');
            }
            const {value: latestBlockhash} = await rpc
              .getLatestBlockhash({commitment: 'confirmed'})
              .send();
            const message = pipe(
              createTransactionMessage({version: 0}),
              m => setTransactionMessageFeePayerSigner(
                transactionSendingSigner as unknown as TransactionSigner<Address<string>>,
                m
              ),
              m => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
              m =>
                appendTransactionMessageInstruction(
                  getTransferSolInstruction({
                    amount,
                    destination: address(recipientAccount.address),
                    source: transactionSendingSigner as unknown as TransactionSigner<Address<string>>,
                  }),
                  m,
                ),
            );
            assertIsTransactionMessageWithSingleSendingSigner(message);
            const signature = await signAndSendTransactionMessageWithSigners(message);
            void mutate({address: transactionSendingSigner.address, chain: currentChain});
            void mutate({address: recipientAccount.address, chain: currentChain});
            setLastSignature(signature);
            setSolQuantityString('');
          } catch (e) {
            setLastSignature(undefined);
            setError(e instanceof Error ? e : new Error('An unknown error occurred'));
          } finally {
            setIsSendingTransaction(false);
          }
        }}
      >
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-[130px]">
              <Label htmlFor={lamportsInputId}>Amount</Label>
              <Input
                id={lamportsInputId}
                disabled={isSendingTransaction}
                placeholder="Amount"
                type="number"
                value={solQuantityString}
                onChange={(e: SyntheticEvent<HTMLInputElement>) =>
                  setSolQuantityString(e.currentTarget.value)
                }
              />
            </div>
            <div className="flex-1">
              <Label htmlFor={recipientSelectId}>To Account</Label>
              <Select
                disabled={isSendingTransaction}
                value={recipientAccount ? getUiWalletAccountStorageKey(recipientAccount) : undefined}
                onValueChange={setRecipientAccountStorageKey}
              >
                <SelectTrigger id={recipientSelectId}>
                  <SelectValue placeholder="Select a Connected Account"/>
                </SelectTrigger>
                <SelectContent>
                  {wallets.flatMap(wallet =>
                    wallet.accounts
                      .filter(({chains}) => chains.includes(currentChain))
                      .map(account => {
                        const key = getUiWalletAccountStorageKey(account);
                        return (
                          <SelectItem key={key} value={key}>
                            <WalletMenuItemContent wallet={wallet}>
                              {account.address}
                            </WalletMenuItemContent>
                          </SelectItem>
                        );
                      }),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Dialog open={!!lastSignature} onOpenChange={(open) => !open && setLastSignature(undefined)}>
          <DialogTrigger asChild>
            <Button
              variant={error ? "default" : "destructive"}
              disabled={solQuantityString === '' || !recipientAccount}
              type="submit"
              className="self-end"
            >
              {isSendingTransaction ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"/>
                  Transferring...
                </div>
              ) : (
                "Transfer"
              )}
            </Button>
          </DialogTrigger>
          {lastSignature && (
            <DialogContent>
              <DialogTitle>You transferred tokens!</DialogTitle>
              <div className="space-y-4">
                <div>
                  <Label>Signature</Label>
                  <div className="mt-1 rounded-lg border bg-muted p-3 font-mono text-sm">
                    {getBase58Decoder().decode(lastSignature)}
                  </div>
                </div>
                <div>
                  <a
                    href={`https://explorer.solana.com/tx/${getBase58Decoder().decode(
                      lastSignature,
                    )}?cluster=${solanaExplorerClusterName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View this transaction on Explorer
                  </a>
                </div>
                <div className="flex justify-end">
                  <DialogClose asChild>
                    <Button>Cool!</Button>
                  </DialogClose>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>

        {error !== NO_ERROR && (
          <ErrorDialog error={error} onClose={() => setError(NO_ERROR)} title="Transfer failed"/>
        )}
      </form>
    </div>
  );
}