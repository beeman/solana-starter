"use client";

import {
    getUiWalletAccountStorageKey,
    UiWallet,
    UiWalletAccount,
    uiWalletAccountBelongsToUiWallet,
    uiWalletAccountsAreSame,
    useWallets,
} from '@wallet-standard/react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useEffect, useMemo, type Dispatch, type SetStateAction } from 'react';
import { SelectedWalletAccountContext, SelectedWalletAccountState } from './selected-wallet-account-context';

const STORAGE_KEY = 'solana-wallet-standard-example-react:selected-wallet-and-address';

function getSavedWalletAccount(wallets: readonly UiWallet[], savedKey: string | null): UiWalletAccount | undefined {
    if (!savedKey) return undefined;
    
    const [savedWalletName, savedAccountAddress] = savedKey.split(':');
    if (!savedWalletName || !savedAccountAddress) return undefined;
    
    // Check if the wallet is available and has populated its accounts
    const wallet = wallets.find(w => w.name === savedWalletName);
    if (!wallet || wallet.accounts.length === 0) return undefined;
    
    return wallet.accounts.find(account => account.address === savedAccountAddress);
}

export function SelectedWalletAccountContextProvider({ children }: { children: React.ReactNode }) {
    const wallets = useWallets();
    const [storedKey, setStoredKey] = useLocalStorage<string | null>(STORAGE_KEY, null);
    const [selectedWalletAccount, setSelectedWalletAccount] = useLocalStorage<SelectedWalletAccountState>(
        'selected-wallet-account',
        undefined
    );

    // Initialize or update wallet account based on stored key
    useEffect(() => {
        const savedAccount = getSavedWalletAccount(wallets, storedKey);
        if (!savedAccount) {
            // Clear selection if saved account is not available
            if (selectedWalletAccount) {
                setSelectedWalletAccount(undefined);
                setStoredKey(null);
            }
            return;
        }

        if (!selectedWalletAccount || !uiWalletAccountsAreSame(savedAccount, selectedWalletAccount)) {
            setSelectedWalletAccount(savedAccount);
        }
    }, [wallets, storedKey, selectedWalletAccount, setSelectedWalletAccount, setStoredKey]);

    // Find current wallet account with validation
    const walletAccount = useMemo(() => {
        if (!selectedWalletAccount) return undefined;

        for (const uiWallet of wallets) {
            if (uiWallet.accounts.length === 0) continue; // Skip wallets with no accounts

            // Try to find exact match
            const exactMatch = uiWallet.accounts.find(account => 
                uiWalletAccountsAreSame(selectedWalletAccount, account)
            );
            if (exactMatch) return exactMatch;

            // Fallback to first account of same wallet if exact match not found
            if (uiWalletAccountBelongsToUiWallet(selectedWalletAccount, uiWallet)) {
                return uiWallet.accounts[0];
            }
        }
        return undefined;
    }, [selectedWalletAccount, wallets]);

    // Clear selection if wallet disconnected or accounts not available
    useEffect(() => {
        if (selectedWalletAccount && !walletAccount) {
            setSelectedWalletAccount(undefined);
            setStoredKey(null);
        }
    }, [selectedWalletAccount, walletAccount, setSelectedWalletAccount, setStoredKey]);

    // Update handler for wallet account selection
    const handleSetWalletAccount: Dispatch<SetStateAction<SelectedWalletAccountState>> = useMemo(() => {
        return (value: SetStateAction<SelectedWalletAccountState>) => {
            const newAccount = typeof value === 'function' 
                ? value(selectedWalletAccount) 
                : value;
            
            setSelectedWalletAccount(newAccount);
            
            if (newAccount) {
                const accountKey = getUiWalletAccountStorageKey(newAccount);
                setStoredKey(accountKey);
            } else {
                setStoredKey(null);
            }
        };
    }, [selectedWalletAccount, setSelectedWalletAccount, setStoredKey]);

    return (
        <SelectedWalletAccountContext.Provider
            value={[walletAccount, handleSetWalletAccount] as const}
        >
            {children}
        </SelectedWalletAccountContext.Provider>
    );
}