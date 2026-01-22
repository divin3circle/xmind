import config from "@/config/env";
import { createThirdwebClient } from "thirdweb";

const clientId = config.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

if (!clientId) {
  throw new Error(
    "NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not defined in environment variables",
  );
}

export const client = createThirdwebClient({
  clientId,
});
