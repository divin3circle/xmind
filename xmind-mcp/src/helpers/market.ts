/**
 * Market intelligence helpers for MCP
 */
export async function getMarketSnapshot() {
  // Mock market data - in production this would call external APIs (glacier, coingecko, etc)
  return {
    timestamp: new Date().toISOString(),
    prices: {
      AVAX: "38.42",
      ETH: "2840.15",
      BTC: "52140.00",
      JOE: "0.52"
    },
    volatility: "moderate",
    market_sentiment: "neutral-bullish",
    gas_price_fuji: "25 gwei",
    dominance: {
      BTC: "52%",
      ETH: "17%",
      Stablecoins: "11%"
    }
  };
}

export async function getYieldOpportunities() {
  return [
    {
      protocol: "TraderJoe",
      pair: "AVAX/USDC",
      apy: "24.5%",
      risk: "Medium",
      liquidity: "High",
      type: "LP"
    },
    {
      protocol: "Aave V3",
      asset: "USDC",
      apy: "4.2%",
      risk: "Low",
      liquidity: "Very High",
      type: "Lending"
    },
    {
        protocol: "Pangolin",
        pair: "ETH/AVAX",
        apy: "12.8%",
        risk: "High",
        liquidity: "Medium",
        type: "LP"
      }
  ];
}
