"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";
import Image from "next/image";
import agentImage from "@/public/currency.webp";
import walletImage from "@/public/connect.webp";
import robotImage from "@/public/robot.png";
import {
  IconInfoCircle,
  IconLoader2,
  IconWallet,
} from "@tabler/icons-react";
import { StepIndicator } from "@/components/step-indicator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTemplates } from "@/hooks/useTemplates";
import { TemplateSelectorCard } from "@/components/template-card";
import { ITemplate } from "@/lib/models/Template";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import config from "@/config/env";
import { AlertDialogModal } from "@/components/alert";
import { useDeployContract } from "@/hooks/useDeployContract";
import { useActiveAccount } from "thirdweb/react";
import { RiskProfile } from "@/lib/types/vault";

const vaultFormSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().min(2).max(200),
  image: z.string().url().optional(),
  systemPrompt: z.string().min(2).max(2000),
  strategyDescription: z.string().min(2).max(500),
  riskProfile: z.nativeEnum(RiskProfile),
  underlyingToken: z.string().length(42),
  geminiKey: z.string().optional(),
});

type FormValues = z.infer<typeof vaultFormSchema>;

// Fuji Testnet Tokens mapping
const TOKENS: Record<string, { address: string; symbol: string; name: string }> = {
  USDC: { address: "0xF130b00B32EFE015FC080f7Dd210B0E937e627c2", symbol: "USDC", name: "USD Coin" },
  WAVAX: { address: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c", symbol: "WAVAX", name: "Wrapped AVAX" },
};

function StepOne({
  nextStep,
  goToStep,
  form,
}: {
  nextStep: () => void;
  goToStep: (step: number) => void;
  form: UseFormReturn<FormValues>;
}) {
  const [assetSymbol, setAssetSymbol] = React.useState<string>("USDC");
  const [risk, setRisk] = React.useState<RiskProfile>(RiskProfile.BALANCED);

  const handleNext = () => {
    form.setValue("underlyingToken", TOKENS[assetSymbol].address);
    form.setValue("riskProfile", risk);
    toast.success(`Selected ${risk} risk profile with ${assetSymbol} base asset.`);
    nextStep();
  };

  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <Image
        src={walletImage}
        alt="Wallet Image"
        width={300}
        height={300}
        className="object-contain"
        placeholder="blur"
      />
      <div>
        <h1 className="text-sm font-semibold text-center">Vault Settings</h1>
        <p className="text-center text-[11px] text-muted-foreground max-w-md mt-1">
          Configure your on-chain agent vault on Avalanche Fuji. Select the base asset and strict risk parameters.
        </p>
      </div>

      <div className="w-full max-w-md mt-4 space-y-4">
        <div>
          <Label className="text-xs mb-1 block">Base Asset (Standard ERC20)</Label>
          <Select value={assetSymbol} onValueChange={setAssetSymbol}>
            <SelectTrigger className="w-full bg-background border-dashed">
              <SelectValue placeholder="Select base asset" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fuji Testnet Assets</SelectLabel>
                {Object.keys(TOKENS).map((symbol) => (
                  <SelectItem key={symbol} value={symbol}>
                    {TOKENS[symbol].name} ({symbol})
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs mb-1 block">AI Risk Profile & Constraints</Label>
          <Select value={risk} onValueChange={(val) => setRisk(val as RiskProfile)}>
            <SelectTrigger className="w-full bg-background border-dashed">
              <SelectValue placeholder="Select risk profile" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Risk Profile</SelectLabel>
                <SelectItem value={RiskProfile.CONSERVATIVE}>Conservative (Capital Preservation)</SelectItem>
                <SelectItem value={RiskProfile.BALANCED}>Balanced (Yield & Growth)</SelectItem>
                <SelectItem value={RiskProfile.AGGRESSIVE}>Aggressive (High Yield / Volatile)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={handleNext}
        className="w-full md:w-1/2 mt-6 border-green-500 border-dashed font-sans"
        variant="outline"
      >
        Next
      </Button>
      <StepIndicator currentStep={1} totalSteps={4} onStepClick={goToStep} />
    </div>
  );
}

function StepTwo({
  nextStep,
  goToStep,
  form,
}: {
  nextStep: () => void;
  goToStep: (step: number) => void;
  form: UseFormReturn<FormValues>;
}) {
  const { templates, loading, error } = useTemplates();
  const [templateSelected, setTemplateSelected] = React.useState<ITemplate | null>(null);

  const handleNext = () => {
    if (templateSelected) {
      form.setValue("systemPrompt", templateSelected.systemPrompt);
      form.setValue("image", templateSelected.image || "");
      form.setValue("name", templateSelected.templateName);
      form.setValue("description", templateSelected.description);
      form.setValue("strategyDescription", templateSelected.description);
      toast.success("Template: " + templateSelected.templateName + " selected");
      nextStep();
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <div>
        <h1 className="text-sm font-semibold text-center">AI Personality</h1>
        <p className="text-center text-[11px] text-muted-foreground max-w-md mt-1">
          Choose a pre-trained strategy template. This dictates how your Vault Agent interprets market data from the MCP.
        </p>
      </div>
      <div className="flex flex-wrap gap-4 mt-2 max-w-4xl justify-center">
        {templates && !loading && !error &&
          templates.map((template) => (
            <div
              key={template._id}
              onClick={() => setTemplateSelected(template)}
              className={
                templateSelected?._id === template._id
                  ? "border-green-500 border border-dashed bg-green-500/10 cursor-pointer"
                  : "cursor-pointer opacity-70 hover:opacity-100"
              }
            >
              <TemplateSelectorCard notNavigable template={template} />
            </div>
          ))}
        {loading && Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="w-48 h-24" />
        ))}
        {error && !loading && <p className="text-red-500 font-sans text-xs">Error loading templates.</p>}
      </div>
      <Button
        className="w-full mt-8 md:w-1/2 border-green-500 border-dashed font-sans"
        variant="outline"
        onClick={handleNext}
        disabled={!templateSelected}
      >
        Next
      </Button>
      <StepIndicator currentStep={2} totalSteps={4} onStepClick={goToStep} />
    </div>
  );
}

function StepThree({
  nextStep,
  goToStep,
  form,
}: {
  nextStep: () => void;
  goToStep: (step: number) => void;
  form: UseFormReturn<FormValues>;
}) {
  const [key, setKey] = React.useState("");
  const [keyAvailable, setKeyAvailable] = React.useState(true);

  const handleSetApiKey = () => {
    if (key.trim() === "" && keyAvailable) {
      return toast.error("Please enter a valid Gemini API Key or toggle off");
    }

    if (!keyAvailable) {
      form.setValue("geminiKey", "");
      toast.success("Proceeding via Central CRE Coordinator");
      nextStep();
      return;
    }

    form.setValue("geminiKey", key.trim());
    toast.success("Gemini API Key bound to Vault");
    nextStep();
  };

  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <Image
        src={agentImage}
        alt="Agent Image"
        width={300}
        height={300}
        className="object-contain"
        placeholder="blur"
      />
      <div>
        <h1 className="text-sm font-semibold text-center">Gemini API Key</h1>
        <p className="text-center text-[11px] text-muted-foreground max-w-md mt-1">
          Vaults run autonomously via Chainlink CRE and Gemini. Provide an API key for this specific agent&apos;s isolated environment.
        </p>
      </div>
      {keyAvailable && (
        <div className="mt-4 w-full max-w-sm border border-dashed p-1">
          <Input
            placeholder={"Enter your Gemini API Key"}
            className="bg-background h-10"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSetApiKey();
              }
            }}
          />
        </div>
      )}
      <div className="flex items-center space-x-2 mt-2">
        <Switch
          id="no-key"
          checked={!keyAvailable}
          onCheckedChange={() => setKeyAvailable(!keyAvailable)}
        />
        <Label htmlFor="no-key" className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
          Use Protocol Global Config
          <Tooltip>
            <TooltipTrigger asChild>
              <IconInfoCircle className="size-4" />
            </TooltipTrigger>
            <TooltipContent className="border border-green-500/50 bg-background border-dashed text-foreground max-w-xs">
              <p className="font-semibold text-[11px] leading-relaxed">
                If toggled off, the vault will use the global CRE execution key. This requires you to hold platform governance tokens or pay vault performance fees.
              </p>
            </TooltipContent>
          </Tooltip>
        </Label>
      </div>
      <Button
        className="w-full mt-8 md:w-1/2 border-green-500 border-dashed font-sans"
        variant="outline"
        onClick={handleSetApiKey}
      >
        Next
      </Button>
      <StepIndicator currentStep={3} totalSteps={4} onStepClick={goToStep} />
    </div>
  );
}

function StepFour({
  submitDetails,
  values,
  goToStep,
  form,
}: {
  submitDetails: (values: FormValues) => void;
  values: FormValues;
  goToStep: (step: number) => void;
  form: UseFormReturn<FormValues>;
}) {
  const [isDeployed, setIsDeployed] = React.useState(false);
  const [savedTransactionHash, setSavedTransactionHash] = React.useState<string>("");
  const { deployAgent, isDeploying, error } = useDeployContract();
  const activeAccount = useActiveAccount();

  const handleDeploy = async () => {
    if (!activeAccount) {
      toast.error("Please connect your wallet first");
      return;
    }

    await deployAgent({
      name: values.name,
      description: values.description,
      image: values.image || "",
      systemPrompt: values.systemPrompt,
      underlyingToken: values.underlyingToken,
      riskProfile: values.riskProfile,
      agentWalletAddress: activeAccount.address, // Owner of the vault
      onSuccess: async (transactionHash, contractAddress) => {
        try {
          const response = await fetch("/api/vault/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: values.name,
              description: values.description,
              image: values.image,
              systemPrompt: values.systemPrompt,
              strategyDescription: values.strategyDescription,
              riskProfile: values.riskProfile,
              vaultAddress: contractAddress || transactionHash,
              creatorAddress: activeAccount.address,
              underlyingToken: values.underlyingToken,
              chainId: 43113, // AVAX_FUJI
              transactionHash: transactionHash,
              geminiKey: values.geminiKey,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to save vault to database");
          }

          submitDetails(values);
          setSavedTransactionHash(transactionHash);
          setIsDeployed(true);
          toast.success("Vault Agent deployed cleanly to Avalanche Fuji!");
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : "Failed to save vault");
          console.error("Database save error:", err);
        }
      },
      onError: (errorMessage) => {
        toast.error(errorMessage);
      },
    });
  };

  const handleSaveAndFinish = () => {
    window.location.href = "/agents"; // Redirect to Vault Directory
  };

  return isDeployed ? (
    <div className="flex flex-col gap-4 items-center justify-center">
      <Image
        src={"/deployed.avif"}
        alt="Deployed Image"
        width={200}
        height={200}
        className="object-contain aspect-[1] rounded-full mt-4 border border-dashed p-1"
      />
      <div className="mt-4">
        <h1 className="text-sm font-semibold text-center mt-2">
          Vault Activated on Avalanche
        </h1>
        <p className="text-center text-[11px] text-muted-foreground max-w-sm mt-2">
          Your AI portfolio manager is live. It will begin trading once deposits are made and the Chainlink CRE oracle emits a signal.
        </p>
      </div>
      {savedTransactionHash && (
        <div className="mt-4 p-3 max-w-md border border-dashed rounded-md bg-muted/20">
          <p className="text-xs font-semibold mb-1 text-center">Deployment Hash:</p>
          <a
            href={`https://testnet.snowtrace.io/tx/${savedTransactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-green-500 text-center hover:underline break-all block"
          >
            {savedTransactionHash}
          </a>
        </div>
      )}
      <div className="mt-6 w-full flex items-center justify-center">
        <Button
          className="w-full md:w-3/4 font-sans bg-green-600 hover:bg-green-700 text-white"
          onClick={handleSaveAndFinish}
        >
          View My Vaults
        </Button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-4 items-center justify-center">
      <Image
        src={robotImage}
        alt="Agent Setup"
        width={200}
        height={200}
        className="object-contain mt-4"
        placeholder="blur"
      />
      <div>
        <h1 className="text-sm font-semibold text-center">Deploy AgentVault.sol</h1>
        <p className="text-center text-[11px] text-muted-foreground max-w-md mt-1">
          Review your strategy constraints. Click deploy to emit the smart contract creation on Avalanche Fuji.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-sm mt-4 p-4 border border-dashed text-xs text-muted-foreground">
        <p><strong className="text-foreground">Name:</strong> {values.name}</p>
        <p><strong className="text-foreground">Risk:</strong> <span className="uppercase text-green-500">{values.riskProfile}</span></p>
        <p><strong className="text-foreground">Base Token:</strong> {Object.keys(TOKENS).find(k => TOKENS[k].address === values.underlyingToken)}</p>
      </div>

      <AlertDialogModal
        values={{...values, walletAddress: "vault-deploy"}}
        onDeploy={handleDeploy}
        isDeploying={isDeploying}
      />
      {isDeploying && (
        <div className="flex items-center text-xs text-muted-foreground text-center mt-2">
           <IconLoader2 className="animate-spin mr-2 size-4" /> 
           Deploying via Factory, confirming blocks...
        </div>
      )}
      {error && <p className="text-red-500 text-xs text-center">{error}</p>}
      
      <StepIndicator currentStep={4} totalSteps={4} onStepClick={goToStep} />
    </div>
  );
}

export function CreateAgentForm() {
  const [step, setStep] = React.useState(1);
  const form = useForm<FormValues>({
    resolver: zodResolver(vaultFormSchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
      systemPrompt: "",
      strategyDescription: "",
      riskProfile: RiskProfile.BALANCED,
      underlyingToken: "",
      geminiKey: "",
    },
  });

  function onSubmit(values: FormValues) {
    console.log("Form Completed:", values);
  }

  function nextStep() {
    if (step >= 4) return;
    setStep((prev) => prev + 1);
  }

  function goToStep(stepNumber: number) {
    if (stepNumber < 1 || stepNumber > 4) return;
    setStep(stepNumber);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex flex-col justify-center min-h-[500px]">
        {step === 1 && <StepOne nextStep={nextStep} goToStep={goToStep} form={form} />}
        {step === 2 && <StepTwo nextStep={nextStep} goToStep={goToStep} form={form} />}
        {step === 3 && <StepThree nextStep={nextStep} goToStep={goToStep} form={form} />}
        {step === 4 && <StepFour submitDetails={onSubmit} values={form.getValues()} goToStep={goToStep} form={form} />}
      </form>
    </Form>
  );
}

