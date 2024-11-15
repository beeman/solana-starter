"use client";

import { AlertTriangle } from 'lucide-react';
import { SolanaSignIn } from '@solana/wallet-standard-features';
import type { UiWallet } from '@wallet-standard/react';
import { useWallets } from '@wallet-standard/react';
import { useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSelectedWalletAccount } from '@/wallet-ui/solana-react';
import { ErrorDialog, UnconnectableWalletMenuItem } from '@/wallet-ui/solana-shadcn';
import { SignInMenuItem } from './SignInMenuItem';

interface Props {
  children: React.ReactNode;
}

export function SignInMenu({ children }: Props) {
  const { current: NO_ERROR } = useRef(Symbol());
  const wallets = useWallets();
  const [, setSelectedWalletAccount] = useSelectedWalletAccount();
  const [error, setError] = useState(NO_ERROR);
  const [forceClose, setForceClose] = useState(false);

  function renderItem(wallet: UiWallet) {
    return (
      <ErrorBoundary
        fallbackRender={({ error }) => <UnconnectableWalletMenuItem error={error} wallet={wallet} />}
        key={`wallet:${wallet.name}`}
      >
        <SignInMenuItem
          onSignIn={account => {
            setSelectedWalletAccount(account);
            setForceClose(true);
          }}
          onError={setError}
          wallet={wallet}
        />
      </ErrorBoundary>
    );
  }

  const walletsThatSupportSignInWithSolana = wallets.filter(wallet => 
    wallet.features.includes(SolanaSignIn)
  );

  return (
    <>
      <DropdownMenu open={forceClose ? false : undefined} onOpenChange={() => setForceClose(false)}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {children}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[300px]">
          {walletsThatSupportSignInWithSolana.length === 0 ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This browser has no wallets installed that support{' '}
                <a 
                  href="https://phantom.app/learn/developers/sign-in-with-solana" 
                  target="_blank"
                  className="font-medium underline underline-offset-4"
                >
                  Sign In With Solana
                </a>
                .
              </AlertDescription>
            </Alert>
          ) : (
            walletsThatSupportSignInWithSolana.map(renderItem)
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {error !== NO_ERROR ? (
        <ErrorDialog error={error} onClose={() => setError(NO_ERROR)} />
      ) : null}
    </>
  );
}