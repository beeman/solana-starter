"use client"

import { ChainContextProvider, RpcContextProvider, SelectedWalletAccountContextProvider } from '@/wallet-ui/solana-react'
import { ReactNode } from 'react';

export function SolanaProviders({ children }: { children: ReactNode }) {
  return (
    <ChainContextProvider>
      <SelectedWalletAccountContextProvider>
        <RpcContextProvider>
          {children}
        </RpcContextProvider>
      </SelectedWalletAccountContextProvider>
    </ChainContextProvider>
  )
}