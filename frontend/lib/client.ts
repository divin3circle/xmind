import config from "@/config/env";
import { createThirdwebClient } from "thirdweb";

const clientId = config.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

if (!clientId) {
  throw new Error(
    "NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not defined in environment variables",
  );
}

// thirdweb client for browser-side usage only needs the public clientId; the
// secret key must stay server-side to avoid leaking credentials.
export const client = createThirdwebClient({
  clientId,
});
