'use client'

import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { getUiWalletAccountStorageKey } from '@wallet-standard/react'

import { Balance } from '@/components/Balance'
import { FeatureNotSupportedCallout } from '@/components/FeatureNotSupportedCallout'
import { SolanaSignAndSendTransactionFeaturePanel } from '@/components/SolanaSignAndSendTransactionFeaturePanel'
import { SolanaSignMessageFeaturePanel } from '@/components/SolanaSignMessageFeaturePanel'
import { WalletAccountIcon } from '@/wallet-ui/solana-shadcn/wallet-account-icon'
import { useChain, useSelectedWalletAccount } from '@/wallet-ui/solana-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function DashboardPage() {
    const { chain } = useChain()
    const [selectedWalletAccount] = useSelectedWalletAccount()
    const errorBoundaryResetKeys = [
        chain,
        selectedWalletAccount && getUiWalletAccountStorageKey(selectedWalletAccount),
    ].filter(Boolean)

    return (
        <div className="justify-center items-center mx-auto px-4 md:px-6 hide-scrollbar">
            {selectedWalletAccount ? (
                <div className="flex flex-col gap-6 justify-center items-center h-screen">
                    <Card>
                        <CardContent className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-3">
                                <WalletAccountIcon 
                                    account={selectedWalletAccount} 
                                    className="w-10 h-10"
                                />
                                <div className="space-y-1">
                                    <CardTitle className="text-xl">
                                        {selectedWalletAccount.label ?? 'Unlabeled Account'}
                                    </CardTitle>
                                    <CardDescription className="font-mono truncate">
                                        {selectedWalletAccount.address}
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="text-right">
                                <CardTitle className="text-xl">Balance</CardTitle>
                                <ErrorBoundary
                                    fallback={<span className="text-muted-foreground">&ndash;</span>}
                                    key={`${selectedWalletAccount.address}:${chain}`}
                                >
                                    <Suspense fallback={<div className="h-5 w-5 animate-spin" />}>
                                        <Balance account={selectedWalletAccount} />
                                    </Suspense>
                                </ErrorBoundary>
                            </div>
                        </CardContent>
                    </Card>

                    <ScrollArea className="">
                        <div className="flex flex-col gap-4">
                            <Card className="">
                                <CardHeader>
                                    <CardTitle>Sign Message</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ErrorBoundary
                                        FallbackComponent={FeatureNotSupportedCallout}
                                        resetKeys={errorBoundaryResetKeys}
                                    >
                                        <SolanaSignMessageFeaturePanel account={selectedWalletAccount} />
                                    </ErrorBoundary>
                                </CardContent>
                            </Card>

                            <Card className="">
                                <CardHeader>
                                    <CardTitle>Sign And Send Transaction</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ErrorBoundary
                                        FallbackComponent={FeatureNotSupportedCallout}
                                        resetKeys={errorBoundaryResetKeys}
                                    >
                                        <SolanaSignAndSendTransactionFeaturePanel account={selectedWalletAccount} />
                                    </ErrorBoundary>
                                </CardContent>
                            </Card>
                        </div>
                    </ScrollArea>
                </div>
            ) : (
                <div className="text-muted-foreground font-mono flex flex-col items-center justify-center h-screen">Click &ldquo;Connect Wallet&rdquo; to get started.</div>
            )}
        </div>
    )
}