"use client";
import { useConnect, useActiveWallet } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { Button } from "./button";
import { IconArrowRightDashed, IconLoader2 } from "@tabler/icons-react";
import { client } from "@/lib/client";
import { toast } from "sonner";
import authService from "@/services/authService";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

function Connect() {
  const { connect, isConnecting, error } = useConnect();
  const activeWallet = useActiveWallet();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (authService.isAuthenticated() && path !== "/agents") {
      router.push("/dashboard");
    }
  }, [router, path]);

  const handleAuthentication = async () => {
    if (!activeWallet) return;

    const walletAddress = activeWallet.getAccount()?.address;
    if (!walletAddress) {
      toast.error("Unable to get wallet address");
      return;
    }

    setIsAuthenticating(true);
    try {
      await authService.authenticate(walletAddress);
      toast.success("Successfully authenticated!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Authentication failed",
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (activeWallet) {
    return (
      <>
        <p className="font-sans text-green-500 text-center my-2 text-xs">
          {activeWallet.getAccount()?.address.slice(0, 6)}...
          {activeWallet.getAccount()?.address.slice(-4)}
        </p>
        <Button
          className=" w-full flex text-muted-foreground h-8 font-semibold border-green-500 border-dashed font-sans"
          variant="outline"
          onClick={handleAuthentication}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? (
            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <>
              Continue
              <IconArrowRightDashed className="ml-2" />
            </>
          )}
        </Button>
      </>
    );
  }

  if (error) {
    toast.error(`Connection Error: ${error.message}`);
  }
  return (
    <Button
      onClick={() =>
        connect(async () => {
          // instantiate wallet
          const wallet = createWallet("io.metamask");
          // connect wallet
          await wallet.connect({
            client,
          });
          // return the wallet
          return wallet;
        })
      }
      className=" w-full flex text-muted-foreground h-8 font-semibold border-green-500 border-dashed font-sans"
      variant="outline"
    >
      {isConnecting ? (
        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <>
          Connect Wallet <IconArrowRightDashed className="ml-2" />
        </>
      )}
    </Button>
  );
}

export default Connect;
