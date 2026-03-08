"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { IconChevronsDown, IconSquareCheckFilled } from "@tabler/icons-react";
import { useSwitchActiveWalletChain, useActiveWalletChain } from "thirdweb/react";
import { avalanche, avalancheFuji } from "thirdweb/chains";
import { toast } from "sonner";

interface Network {
  name: string;
  chain: typeof avalanche | typeof avalancheFuji;
}

const networks: Network[] = [
  { name: "Avalanche Mainnet", chain: avalanche },
  { name: "Avalanche Fuji", chain: avalancheFuji },
];

function NetworkToggle() {
  const switchChain = useSwitchActiveWalletChain();
  const activeChain = useActiveWalletChain();

  const handleNetworkSwitch = async (network: Network) => {
    try {
      await switchChain(network.chain);
      toast.success(`Switched to ${network.name}`);
    } catch (error) {
      console.error("Failed to switch network:", error);
      toast.error("Failed to switch network. Please try manually in your wallet.");
    }
  };

  const selectedNetwork = 
    networks.find((n) => n.chain.id === activeChain?.id) || networks[1]; // Default to Fuji if unknown

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex text-muted-foreground h-8 font-semibold border-green-500 border-dashed font-sans"
        >
          <span className="hidden md:block">{selectedNetwork.name}</span>
          <IconChevronsDown size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <h1 className="font-sans font-semibold text-sm">Select Network</h1>
        <p className="font-sans text-xs text-muted-foreground">
          Choose the network you want to connect to.
        </p>
        <div className="mt-1 flex flex-col gap-2">
          {networks.map((network) => (
            <div
              onClick={() => handleNetworkSwitch(network)}
              key={network.chain.id}
              className="font-sans text-sm bg-transparent text-foreground/50 hover:text-foreground p-2 hover:border-green-500 border border-dashed flex items-center justify-between cursor-pointer"
            >
              {network.name}
              {activeChain?.id === network.chain.id && (
                <IconSquareCheckFilled size={16} color="green" />
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NetworkToggle;
