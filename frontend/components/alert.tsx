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

type AgentReviewValues = {
  walletAddress: string;
  privateKey: string;
  geminiKey?: string;
  name: string;
  description: string;
  contractAddress: string;
  image: string;
  creatorAddress: string;
  systemPrompt: string;
  tasksCompleted: number;
  tasksRan: number;
  tasks?: string[];
};

export function AlertDialogModal({
  values,
  onDeploy,
  isDeploying,
}: {
  values: AgentReviewValues;
  onDeploy: () => void;
  isDeploying?: boolean;
}) {
  const shortAddress = values.walletAddress
    ? `${values.walletAddress.slice(0, 6)}...${values.walletAddress.slice(-4)}`
    : "Not set";
  const shortPrivateKey = values.privateKey
    ? `${values.privateKey.slice(0, 6)}...${values.privateKey.slice(-4)}`
    : "Not set";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="w-full mt-8 md:w-1/2 border-green-500 border-dashed font-sans"
          variant="outline"
        >
          Review
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Review agent details</AlertDialogTitle>
          <AlertDialogDescription>
            Confirm the parameters before deploying your agent to Cronos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 text-xs font-sans">
          <p>
            <span className="font-semibold">Name:</span>{" "}
            {values.name || "Not set"}
          </p>
          <p>
            <span className="font-semibold">Description:</span>{" "}
            {values.description || "Not set"}
          </p>
          <p>
            <span className="font-semibold">Wallet:</span> {shortAddress}
          </p>
          <p>
            <span className="font-semibold">Private Key:</span>{" "}
            {shortPrivateKey}
          </p>
          <p>
            <span className="font-semibold">Gemini Key:</span>{" "}
            {values.geminiKey ? "Provided" : "Pay-per-use"}
          </p>
          <p>
            <span className="font-semibold">System Prompt:</span>{" "}
            {values.systemPrompt || "Not set"}
          </p>
          <p>
            <span className="font-semibold">Tasks:</span>
          </p>
          {values.tasks?.length ? (
            <ul className="list-disc pl-4 text-[11px] space-y-1">
              {values.tasks.map((task, idx) => (
                <li key={idx}>{task}</li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-muted-foreground">No tasks added</p>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeploying}>Close</AlertDialogCancel>
          <AlertDialogAction onClick={onDeploy} disabled={isDeploying}>
            {isDeploying ? (
              <>
                <IconLoader2 className="animate-spin mr-2 size-4" />
                Deploying...
              </>
            ) : (
              "Deploy for 2 CRO"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
