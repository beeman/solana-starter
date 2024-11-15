"use client";

import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/web3.js';
import { ReactNode, useMemo } from 'react';

import { useChain } from './chain-context';
import { RpcContext } from './rpc-context';

type Props = Readonly<{
    children: ReactNode;
}>;

export function RpcContextProvider({ children }: Props) {
    const { solanaRpcSubscriptionsUrl, solanaRpcUrl } = useChain();
    return (
        <RpcContext.Provider
            value={useMemo(
                () => ({
                    rpc: createSolanaRpc(solanaRpcUrl),
                    rpcSubscriptions: createSolanaRpcSubscriptions(solanaRpcSubscriptionsUrl),
                }),
                [solanaRpcSubscriptionsUrl, solanaRpcUrl],
            )}
        >
            {children}
        </RpcContext.Provider>
    );
}
