"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { IconLoader2 } from "@tabler/icons-react";
import { RiskProfile } from "@/lib/types/vault";

type VaultReviewValues = {
  walletAddress: string;
  geminiKey?: string;
  name: string;
  description: string;
  image?: string;
  systemPrompt: string;
  strategyDescription: string;
  riskProfile: RiskProfile;
  underlyingToken: string;
};

// Fuji Testnet Tokens mapping (Duplicated for alert display purposes)
const TOKENS: Record<string, string> = {
  "0x5425890298aed601595a70ab815c96711a31Bc65": "USDC",
  "0xd00ae08403B9bbb9124bB305C09058E32C39A48c": "WAVAX",
};

export function AlertDialogModal({
  values,
  onDeploy,
  isDeploying,
}: {
  values: VaultReviewValues;
  onDeploy: () => void;
  isDeploying?: boolean;
}) {
  const shortAddress = values.walletAddress
    ? `${values.walletAddress.slice(0, 6)}...${values.walletAddress.slice(-4)}`
    : "Not connected";
    
  const assetSymbol = TOKENS[values.underlyingToken] || "Unknown Base Asset";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="w-full mt-8 md:w-3/4 bg-green-600 hover:bg-green-700 text-white font-sans"
          disabled={isDeploying}
        >
          Review & Deploy
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Review Vault Specifications</AlertDialogTitle>
          <AlertDialogDescription>
            Confirm these parameters before emitting the deployment transaction to Avalanche Fuji.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 text-xs font-sans bg-muted/20 p-4 border border-dashed rounded-md">
          <p>
            <span className="font-semibold">Name:</span>{" "}
            {values.name || "Not set"}
          </p>
          <p>
            <span className="font-semibold">Strategy:</span>{" "}
            {values.description || "Not set"}
          </p>
          <p>
            <span className="font-semibold">Base Asset:</span>{" "}
            {assetSymbol}
          </p>
          <p className="flex items-center">
            <span className="font-semibold mr-1">Risk Profile:</span>{" "}
            <span className={`uppercase font-bold ${
              values.riskProfile === RiskProfile.AGGRESSIVE ? 'text-red-500' : 
              values.riskProfile === RiskProfile.BALANCED ? 'text-yellow-500' : 
              'text-green-500'
            }`}>{values.riskProfile}</span>
          </p>
          <p>
            <span className="font-semibold">Owner Address:</span> {shortAddress}
          </p>
          <p>
            <span className="font-semibold">AI Oracle (Gemini):</span>{" "}
            {values.geminiKey ? "Custom API Key Provided" : "Globally Managed (Pay-per-use)"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-2 border-t border-dashed pt-2">
            <span className="font-semibold">System Prompt preview: </span>
            {values.systemPrompt?.slice(0, 100)}...
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeploying}>Close</AlertDialogCancel>
          <AlertDialogAction onClick={onDeploy} disabled={isDeploying} className="bg-green-600 text-white hover:bg-green-700">
            {isDeploying ? (
              <>
                <IconLoader2 className="animate-spin mr-2 size-4" />
                Deploying Vault...
              </>
            ) : (
              "Confirm Deployment"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
