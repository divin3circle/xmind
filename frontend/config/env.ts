const config = {
  MONGODB_URI: process.env.MONGODB_URI || "",
  PORT: process.env.PORT || 3000,
  THIRDWEB_SECRET_KEY: process.env.THIRDWEB_SECRET_KEY,
  NEXT_PUBLIC_THIRDWEB_CLIENT_ID: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
  SERVER_WALLET_ADDRESS: process.env.SERVER_WALLET_ADDRESS || "",
  APP_URL: getAppUrl(),
  NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS:
    process.env.NEXT_PUBLIC_PAYMENT_TOKEN_ADDRESS || "",
  NEXT_PUBLIC_PAYMENT_TOKEN_DECIMALS: process.env
    .NEXT_PUBLIC_PAYMENT_TOKEN_DECIMALS
    ? parseInt(process.env.NEXT_PUBLIC_PAYMENT_TOKEN_DECIMALS)
    : 6,
  NEXT_PUBLIC_PAYMENT_TOKEN_SYMBOL:
    process.env.NEXT_PUBLIC_PAYMENT_TOKEN_SYMBOL || "",
};

function getAppUrl() {
  if (process.env.NODE_ENV === "production") {
    return "https://xmind-dusky.vercel.app/";
  } else {
    return `http://localhost:3000/`;
  }
}

export default config;
