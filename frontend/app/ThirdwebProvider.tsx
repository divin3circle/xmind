// app/layout.tsx
import { defineChain } from "thirdweb/chains";
import { ThirdwebProvider } from "thirdweb/react";

const ThirdWeb = ({ children }: { children: React.ReactNode }) => {
  return <ThirdwebProvider>{children}</ThirdwebProvider>;
};

export const cronosZkEvmTestnet = defineChain({
  id: 240,
  rpc: "https://240.rpc.thirdweb.com/${THIRDWEB_API_KEY}",
  nativeCurrency: {
    name: "Cronos zkEVM Test CRO",
    symbol: "zkTCRO",
    decimals: 18,
  },
});

export const cronosTestnet = defineChain({
  id: 338,
  rpc: "https://338.rpc.thirdweb.com/${THIRDWEB_API_KEY}",
  nativeCurrency: {
    name: "Test Cronos",
    symbol: "TRCO",
    decimals: 18,
  },
});

export default ThirdWeb;
