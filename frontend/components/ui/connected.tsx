"use client";
import { useActiveWallet } from "thirdweb/react-native";
import { Button } from "./button";
import Connect from "./connect";

function Connected() {
  const activeWallet = useActiveWallet();

  if (!activeWallet) {
    return (
      <div>
        <Connect />
      </div>
    );
  }

  return (
    <Button
      variant={"outline"}
      className="flex text-muted-foreground h-8 font-semibold border-green-500 border-dashed font-sans"
    >
      <p className="font-sans text-green-500 text-center my-2 text-xs">
        {activeWallet.getAccount()?.address.slice(0, 6)}...
        {activeWallet.getAccount()?.address.slice(-4)}
      </p>
    </Button>
  );
}

export default Connected;
