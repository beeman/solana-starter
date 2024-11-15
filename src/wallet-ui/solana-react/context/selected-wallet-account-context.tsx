"use client";

import type { UiWalletAccount } from '@wallet-standard/react';
import { createContext, useContext } from 'react';

export type SelectedWalletAccountState = UiWalletAccount | undefined;

export const SelectedWalletAccountContext = createContext<
    readonly [
        selectedWalletAccount: SelectedWalletAccountState,
        setSelectedWalletAccount: React.Dispatch<React.SetStateAction<SelectedWalletAccountState>>,
    ]
>([
    undefined /* selectedWalletAccount */,
    function setSelectedWalletAccount() {
        /* empty */
    },
]);

export function useSelectedWalletAccount() {
    return useContext(SelectedWalletAccountContext);
}