"use client"

import { ChainContextProvider, RpcContextProvider, SelectedWalletAccountContextProvider } from '@/wallet-ui/solana-react'
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
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