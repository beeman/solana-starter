"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelectedWalletAccount } from '@/wallet-ui/solana-react'

export function WalletGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [selectedWalletAccount] = useSelectedWalletAccount()

  useEffect(() => {
    if (!selectedWalletAccount) {
      router.replace('/')
    }
  }, [selectedWalletAccount, router])

  if (!selectedWalletAccount) return null

  return children
}