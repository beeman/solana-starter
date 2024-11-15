"use client";

import { getErrorMessage } from "@/wallet-ui/solana-shadcn/errors";
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { StandardConnect, StandardDisconnect } from '@wallet-standard/core';
import type { UiWallet } from '@wallet-standard/react';
import { uiWalletAccountBelongsToUiWallet, useWallets } from '@wallet-standard/react';
import { useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useSelectedWalletAccount } from '@/wallet-ui/solana-react';
import { ConnectWalletMenuItem } from './connect-wallet-menu-item';
import { ErrorDialog } from './error-dialog';
import { UnconnectableWalletMenuItem } from './unconnectable-wallet-menu-item';
import { WalletAccountIcon } from './wallet-account-icon';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";

interface Props {
    children: React.ReactNode;
}

export function ConnectWalletMenu({ children }: Props) {
    const { current: NO_ERROR } = useRef(Symbol());
    const wallets = useWallets();
    const [selectedWalletAccount, setSelectedWalletAccount] = useSelectedWalletAccount();
    const [error, setError] = useState(NO_ERROR);
    const [open, setOpen] = useState(false);

    function renderItem(wallet: UiWallet) {
        return (
            <ErrorBoundary
                fallbackRender={({ error }) => <UnconnectableWalletMenuItem error={error} wallet={wallet} />}
                key={`wallet:${wallet.name}`}
            >
                <ConnectWalletMenuItem
                    onAccountSelect={account => {
                        setSelectedWalletAccount(account);
                        setOpen(false);
                    }}
                    onDisconnect={wallet => {
                        if (selectedWalletAccount && uiWalletAccountBelongsToUiWallet(selectedWalletAccount, wallet)) {
                            setSelectedWalletAccount(undefined);
                        }
                    }}
                    onError={setError}
                    wallet={wallet}
                />
            </ErrorBoundary>
        );
    }

    const walletsThatSupportStandardConnect = wallets.filter(
        wallet => wallet.features.includes(StandardConnect) && wallet.features.includes(StandardDisconnect)
    );
    const unconnectableWallets = wallets.filter(
        wallet => !wallet.features.includes(StandardConnect) || !wallet.features.includes(StandardDisconnect)
    );

    return (
        <>
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        {selectedWalletAccount ? (
                            <>
                                <WalletAccountIcon className="w-4 h-4" account={selectedWalletAccount} />
                                <span>{selectedWalletAccount.address.slice(0, 8)}</span>
                            </>
                        ) : (
                            children
                        )}
                        <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-[240px]">
                    {wallets.length === 0 ? (
                        <Alert variant="destructive" className="m-2">
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            <AlertDescription>
                                This browser has no wallets installed.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            {walletsThatSupportStandardConnect.map(renderItem)}
                            {unconnectableWallets.length > 0 && (
                                <>
                                    <DropdownMenuSeparator />
                                    {unconnectableWallets.map(renderItem)}
                                </>
                            )}
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {error !== NO_ERROR && (
                <ErrorDialog error={error} onClose={() => setError(NO_ERROR)} />
            )}
        </>
    );
}