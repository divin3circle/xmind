// app/layout.tsx
import { defineChain } from "thirdweb/chains";
import { ThirdwebProvider } from "thirdweb/react";

const ThirdWeb = ({ children }: { children: React.ReactNode }) => {
  return <ThirdwebProvider>{children}</ThirdwebProvider>;
};

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
