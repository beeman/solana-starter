"use client";

import Image from 'next/image'
import Link from 'next/link'
import { ChainSelector, ConnectWalletMenu } from '@/wallet-ui/solana-shadcn';
import { SignInMenu } from './SignInMenu';
import { ModeToggle } from '@/components/ui/theme-toggle';
import GithubStarsButton from './GithubStarsButton';
export function Nav() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex flex-1">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logomark-solana.svg"
              alt="Solana Logo"
              width={32}
              height={32}
              className="h-8 w-8 mr-4"
            />
          </Link>
          <GithubStarsButton />
          {/* <Link href="/blog">Blog</Link> */}

        </div>
        <div className="flex items-center gap-4">
          <ConnectWalletMenu>Connect Wallet</ConnectWalletMenu>
          <SignInMenu>Sign In</SignInMenu>
          <ChainSelector />
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}