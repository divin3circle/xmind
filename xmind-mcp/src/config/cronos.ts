import { createThirdwebClient } from "thirdweb";

import { defineChain } from "thirdweb/chains";

export const DEVUSDCeAddress = "0xc01efaaf7c5c61bebfaeb358e1161b537b8bc0e0";

const clientId = "17ed118a3a517de629e0829fae02cf32";

if (!clientId) {
  throw new Error("CLIENT_ID is not defined in environment variables");
}

export const client = createThirdwebClient({
  clientId,
});

export const cronosTestnet = defineChain({
  id: 338,
  rpc: "https://evm-t3.cronos.org/",
  nativeCurrency: {
    name: "Test Cronos",
    symbol: "TRCO",
    decimals: 18,
  },
});
