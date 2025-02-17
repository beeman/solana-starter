"use client";

import { useContext } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChainContext } from '../context/ChainContext';

export function ChainSelector() {
  const { displayName: currentChainName, chain, setChain } = useContext(ChainContext);
  
  const currentChainBadge = (
    <Button variant="outline">
      {currentChainName}
    </Button>
  );

  if (!setChain) {
    return currentChainBadge;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="inline-flex items-center gap-1">
        {currentChainBadge}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={chain}
          onValueChange={(value) => {
            setChain(value as `solana:${string}`);
          }}
        >
          {process.env.REACT_EXAMPLE_APP_ENABLE_MAINNET === 'true' && (
            <DropdownMenuRadioItem value="solana:mainnet">
              Mainnet Beta
            </DropdownMenuRadioItem>
          )}
          <DropdownMenuRadioItem value="solana:devnet">
            Devnet
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="solana:testnet">
            Testnet
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}