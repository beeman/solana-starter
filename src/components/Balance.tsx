"use client";

import { HoverCard, HoverCardContent, HoverCardTrigger, } from "@/components/ui/hover-card"
import { address } from '@solana/web3.js';
import type { UiWalletAccount } from '@wallet-standard/react';
import { useChain, useRpc } from '@/wallet-ui/solana-react';
import { ErrorDialog } from '@/wallet-ui/solana-shadcn';
import { useMemo } from 'react';
import useSWRSubscription from 'swr/subscription';
import { IconExclamationmarkTriangle } from 'symbols-react';
import { getErrorMessage } from '@/wallet-ui/solana-shadcn';
import { balanceSubscribe } from '../functions/balance';

type Props = Readonly<{
    account: UiWalletAccount;
}>;

const seenErrors = new WeakSet();

export function Balance({ account }: Props) {
    const { chain } = useChain();
    const { rpc, rpcSubscriptions } = useRpc();
    const subscribe = useMemo(() => balanceSubscribe.bind(null, rpc, rpcSubscriptions), [rpc, rpcSubscriptions]);
    const { data: lamports, error } = useSWRSubscription({ address: address(account.address), chain }, subscribe);

    if (error && !seenErrors.has(error)) {
        return (
            <>
                <ErrorDialog
                    error={error}
                    key={`${account.address}:${chain}`}
                    onClose={() => {
                        seenErrors.add(error);
                    }}
                    title="Failed to fetch account balance"
                />
                <HoverCard>
                    <HoverCardTrigger>
                        <IconExclamationmarkTriangle
                            className="h-4 w-4 fill-destructive"
                        />
                    </HoverCardTrigger>
                    <HoverCardContent>
                        Could not fetch balance: {getErrorMessage(error, 'Unknown reason')}
                    </HoverCardContent>
                </HoverCard>
            </>
        );
    } else if (lamports == null) {
        return <span className="text-muted-foreground">&ndash;</span>;
    } else {
        const formattedSolValue = new Intl.NumberFormat(undefined, { maximumFractionDigits: 5 }).format(
            // @ts-expect-error This format string is 100% allowed now.
            `${lamports}E-9`,
        );
        return <span className="text-foreground">{`${formattedSolValue} \u25CE`}</span>;
    }
}