"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { IconChevronsDown, IconSquareCheckFilled } from "@tabler/icons-react";

interface Network {
  name: string;
  chainId: number;
}

const networks: Network[] = [
  { name: "Cronos zkEVM Testnet", chainId: 338 },
  { name: "Cronos zkEVM Mainnet", chainId: 25 },
];

function NetworkToggle() {
  const [selectedNetwork, setSelectedNetwork] = React.useState<Network>({
    name: "Cronos zkEVM Testnet",
    chainId: 338,
  });
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
              onClick={() => setSelectedNetwork(network)}
              key={network.chainId}
              className="font-sans text-sm bg-transparent text-foreground/50 hover:text-foreground p-2 hover:border-green-500 border border-dashed flex items-center justify-between cursor-pointer"
            >
              {network.name}
              {selectedNetwork.chainId === network.chainId && (
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
