"use client";

import { IconPencil } from "symbols-react";
import { getBase64Decoder } from '@solana/web3.js';
import type { ReadonlyUint8Array } from '@wallet-standard/core';
import type { SyntheticEvent } from 'react';
import { useRef, useState } from 'react';
import { ErrorDialog } from '@/wallet-ui/solana-shadcn';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Card,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type Props = Readonly<{
    signMessage(message: ReadonlyUint8Array): Promise<ReadonlyUint8Array>;
}>;

export function BaseSignMessageFeaturePanel({ signMessage }: Props) {
    const { current: NO_ERROR } = useRef(Symbol());
    const [isSigningMessage, setIsSigningMessage] = useState(false);
    const [error, setError] = useState(NO_ERROR);
    const [lastSignature, setLastSignature] = useState<ReadonlyUint8Array | undefined>();
    const [text, setText] = useState<string>();

    return (
        <form
            className="flex flex-col sm:flex-row gap-2 w-full"
            onSubmit={async e => {
                e.preventDefault();
                setError(NO_ERROR);
                setIsSigningMessage(true);
                try {
                    const signature = await signMessage(new TextEncoder().encode(text));
                    setLastSignature(signature);
                } catch (e) {
                    setLastSignature(undefined);
                    setError(e as symbol);
                } finally {
                    setIsSigningMessage(false);
                }
            }}
        >
            <div className="flex-grow">
                <div className="relative">
                    <Input
                        placeholder="Write a message to sign"
                        onChange={(e: SyntheticEvent<HTMLInputElement>) => 
                            setText(e.currentTarget.value)}
                        value={text}
                        className="pl-8"
                    />
                    <IconPencil className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 fill-muted-foreground" />
                </div>
            </div>

            <Dialog
                open={!!lastSignature}
                onOpenChange={open => {
                    if (!open) {
                        setLastSignature(undefined);
                    }
                }}
            >
                <DialogTrigger asChild>
                    <Button
                        variant={error ? "destructive" : "default"}
                        disabled={!text}
                        type="submit"
                    >
                        {isSigningMessage ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            "Sign Message"
                        )}
                    </Button>
                </DialogTrigger>

                {lastSignature && (
                    <DialogContent>
                        <DialogTitle>You Signed a Message!</DialogTitle>
                        <ScrollArea className="max-h-[80vh]">
                            <div className="space-y-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-sm font-medium">Message</div>
                                        <div className="mt-2 rounded-md bg-muted p-3">
                                            {text}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Separator />
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-sm font-medium">Signature</div>
                                        <span className="mt-2 w-full break-all">
                                            {getBase64Decoder().decode(lastSignature)}
                                        </span>
                                    </CardContent>
                                </Card>
                            </div>
                        </ScrollArea>
                        <div className="flex justify-end mt-4">
                            <DialogClose asChild>
                                <Button>Cool!</Button>
                            </DialogClose>
                        </div>
                    </DialogContent>
                )}
            </Dialog>

            {error !== NO_ERROR && (
                <ErrorDialog 
                    error={error} 
                    onClose={() => setError(NO_ERROR)} 
                    title="Failed to sign message" 
                />
            )}
        </form>
    );
}