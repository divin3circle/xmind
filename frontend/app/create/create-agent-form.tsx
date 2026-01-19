"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";
import Image from "next/image";
import agentImage from "@/public/currency.webp";
import walletImage from "@/public/connect.webp";
import robotImage from "@/public/robot.png";
import {
  IconCheck,
  IconCopy,
  IconInfoCircle,
  IconWallet,
} from "@tabler/icons-react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronRightIcon } from "lucide-react";
import { useTemplates } from "@/hooks/useTemplates";
import { TemplateSelectorCard } from "@/components/template-card";
import { ITemplate } from "@/lib/models/Template";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface CreatedWallet {
  walletAddress: string;
  privateKey: string;
}

const formSchema = z.object({
  walletAddress: z.string().min(2).max(50),
  privateKey: z.string().min(2).max(100),
  geminiKey: z.string().min(2).max(100).optional(),
  name: z.string().min(2).max(50),
  description: z.string().min(2).max(200),
  tasksCompleted: z.number().min(0),
  contractAddress: z.string().min(2).max(100),
  tasks: z.array(z.string()).optional(),
  image: z.string().url(),
  creatorAddress: z.string().min(2).max(50),
  systemPrompt: z.string().min(2).max(1000),
  tasksRan: z.number().min(0),
});

function StepOne({ nextStep }: { nextStep: () => void }) {
  const [isWalletCreated, setIsWalletCreated] = React.useState(false);
  const [createdWallet, setCreatedWallet] =
    React.useState<CreatedWallet | null>(null);

  const handleNext = () => {
    if (isWalletCreated) {
      // set relevant form values here if needed
      nextStep();
    }
  };
  return (
    <>
      {isWalletCreated ? (
        <div className="flex flex-col gap-4 items-center justify-center">
          <div>
            <h1 className="text-sm font-semibold text-center">
              Wallet Created!
            </h1>
            <p className="text-center text-[11px] text-muted-foreground max-w-md">
              Your Cronos EVM Wallet has been successfully created. You can now
              proceed to set up your AI agent.
            </p>
          </div>
          <div className="flex w-full max-w-md flex-col gap-6">
            <Item variant="outline">
              <ItemContent>
                <ItemTitle>Private Key</ItemTitle>
                <ItemDescription className="text-[11px]">
                  Keep it secure and do not share it with anyone.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button variant="outline" size="sm" className="text-[11px]">
                  Copy
                  <IconCopy className="ml-2 size-4" />
                </Button>
              </ItemActions>
            </Item>
            <Item variant="outline" size="sm" asChild>
              <a href="#">
                <ItemMedia>
                  <IconWallet className="size-6" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>View Wallet</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <ChevronRightIcon className="size-4" />
                </ItemActions>
              </a>
            </Item>
          </div>
          <Button
            onClick={handleNext}
            className="w-full md:w-1/2 border-green-500 border-dashed font-sans"
            variant="outline"
          >
            Next
          </Button>
        </div>
      ) : (
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
            <h1 className="text-sm font-semibold text-center">Agent Wallet</h1>
            <p className="text-center text-[11px] text-muted-foreground max-w-md">
              Your agent needs a Cronos EVM Wallet to operate autonomously on
              the Cronos blockchain.
            </p>
          </div>
          <Button
            className="w-full md:w-1/2 border-green-500 border-dashed font-sans"
            variant="outline"
            onClick={() => setIsWalletCreated(true)}
          >
            Create Wallet
          </Button>
          <div className="flex mt-4 items-center justify-between">
            <div className="border border-green-500/50 border-dashed w-6 h-6 flex items-center justify-center text-xs font-semibold">
              1
            </div>
            <hr className="md:w-24 w-10 border-t border-dashed border-green-500/10" />
            <div className="border border-green-500/10 border-dashed text-muted-foreground w-6 h-6 flex items-center justify-center text-xs font-semibold">
              2
            </div>
            <hr className="md:w-24 w-10 border-t border-dashed border-green-500/10" />
            <div className="border border-green-500/10 border-dashed text-muted-foreground w-6 h-6 flex items-center justify-center text-xs font-semibold">
              3
            </div>
            <hr className="md:w-24 w-10 border-t border-dashed border-green-500/10" />
            <div className="border border-green-500/10 border-dashed text-muted-foreground w-6 h-6 flex items-center justify-center text-xs font-semibold">
              <IconCheck size={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StepTwo({ nextStep }: { nextStep: () => void }) {
  const [key, setKey] = React.useState("");
  const [keyAvailable, setKeyAvailable] = React.useState(true);

  const handleSetApiKey = () => {
    // Logic to save the Gemini API key
    nextStep();
  };

  const handleNext = () => {
    // Save key & proceed to the next step
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
        <p className="text-center text-[11px] text-muted-foreground max-w-md">
          Under the hood we use Gemini to power the LLM capabilities of your
          agent. Please provide your Gemini API key to proceed.
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
      <div className="flex items-center space-x-2">
        <Switch
          id="no-key"
          checked={!keyAvailable}
          onCheckedChange={() => setKeyAvailable(!keyAvailable)}
        />
        <Label
          htmlFor="no-key"
          className="text-muted-foreground flex items-center justify-center gap-1"
        >
          Don&apos;t have a Gemini API Key? Pay per use is available.
          <Tooltip>
            <TooltipTrigger asChild>
              <IconInfoCircle className="size-4" />
            </TooltipTrigger>
            <TooltipContent className="border border-green-500/50 bg-background border-dashed text-foreground">
              <p className="font-semibold text-[11px] leading-relaxed">
                Your Agent will have to pay for each request made to
                Gemini&apos;s API directly from its wallet. Make sure your
                agent&apos;s wallet is funded to avoid interruptions.
              </p>
            </TooltipContent>
          </Tooltip>
        </Label>
      </div>
      <Button
        className="w-full mt-8 md:w-1/2 border-green-500 border-dashed font-sans"
        variant="outline"
        onClick={handleNext}
      >
        Next
      </Button>
      <div className="flex mt-4 items-center justify-between">
        <div className="border border-green-500/50 border-dashed  text-muted-foreground w-6 h-6 flex items-center justify-center text-xs font-semibold">
          1
        </div>
        <hr className="md:w-24 w-10 border-t border-dashed border-green-500/50" />
        <div className="border  border-green-500/50 border-dashed w-6 h-6 flex items-center justify-center text-xs font-semibold">
          2
        </div>
        <hr className="md:w-24 w-10 border-t border-dashed border-green-500/10" />
        <div className="border border-green-500/10 border-dashed text-muted-foreground w-6 h-6 flex items-center justify-center text-xs font-semibold">
          3
        </div>
        <hr className="md:w-24 w-10 border-t border-dashed border-green-500/10" />
        <div className="border border-green-500/10 border-dashed text-muted-foreground w-6 h-6 flex items-center justify-center text-xs font-semibold">
          <IconCheck size={14} />
        </div>
      </div>
    </div>
  );
}

function StepThree({ nextStep }: { nextStep: () => void }) {
  const { templates, loading, error } = useTemplates();
  const [templateSelected, setTemplateSelected] =
    React.useState<ITemplate | null>(null);

  const handleNext = () => {
    if (templateSelected) {
      // set relevant form values here if needed
      nextStep();
    }
  };
  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <div>
        <h1 className="text-sm font-semibold text-center">Agent Template</h1>
        <p className="text-center text-[11px] text-muted-foreground max-w-md">
          Choose from a variety of pre-defined agent templates to streamline
          your agent creation process.
        </p>
      </div>
      <div className="flex flex-wrap gap-4 mt-2  max-w-4xl">
        {templates &&
          !loading &&
          !error &&
          templates.map((template) => (
            <div
              key={template._id}
              onClick={() => setTemplateSelected(template)}
              className={
                templateSelected?._id === template._id
                  ? "border-green-500 border border-dashed bg-green-500/10"
                  : ""
              }
            >
              <TemplateSelectorCard notNavigable template={template} />
            </div>
          ))}
        {loading &&
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="w-48 h-24 " />
          ))}
        {error && !loading && (
          <p className="text-red-500 font-sans">
            Error loading agents: {error}
          </p>
        )}
      </div>
      <Button
        className="w-full mt-8 md:w-1/2 border-green-500 border-dashed font-sans"
        variant="outline"
        onClick={handleNext}
      >
        Next
      </Button>
      <div className="flex mt-4 items-center justify-between">
        <div className="border border-green-500/50 border-dashed text-muted-foreground w-6 h-6 flex items-center justify-center text-xs font-semibold">
          1
        </div>
        <hr className="md:w-24 w-10 border-t border-dashed border-green-500/50" />
        <div className="border  border-green-500/50 border-dashed text-muted-foreground w-6 h-6 flex items-center justify-center text-xs font-semibold">
          2
        </div>
        <hr className="md:w-24 w-10 border-t border-dashed border-green-500/50" />
        <div className="border border-green-500/50 border-dashed  w-6 h-6 flex items-center justify-center text-xs font-semibold">
          3
        </div>
        <hr className="md:w-24 w-10 border-t border-dashed border-green-500/10" />
        <div className="border border-green-500/10 border-dashed text-muted-foreground w-6 h-6 flex items-center justify-center text-xs font-semibold">
          <IconCheck size={14} />
        </div>
      </div>
    </div>
  );
}

function StepFour({ nextStep }: { nextStep: () => void }) {
  const handleNext = () => {
    // set relevant form values here if needed
    nextStep();
  };
  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <Image
        src={robotImage}
        alt="Agent Image"
        width={200}
        height={200}
        className="object-contain"
        placeholder="blur"
      />
      <div>
        <h1 className="text-sm font-semibold text-center">Deploy Agent</h1>
        <p className="text-center text-[11px] text-muted-foreground max-w-md">
          Congratulations you made it, let&#39;s deploy your agent params to the
          Cronos Blockchain and get Started.
        </p>
      </div>
      <Button className="w-full mt-8 md:w-1/2 font-sans" onClick={handleNext}>
        Deploy for 2 CRO
      </Button>
      <p className="text-xs text-muted-foreground max-w-md text-center">
        By deploying your agent, you agree to our Terms of
        <Link href={"#"} className="text-green-500/50 underline ml-1">
          Service
        </Link>{" "}
        and{" "}
        <Link href={"#"} className="text-green-500/50 underline">
          Privacy Policy.
        </Link>
      </p>
      <div className="flex mt-4 items-center justify-between">
        <div className="border border-green-500/50 border-dashed text-muted-foreground w-6 h-6 flex items-center justify-center text-xs font-semibold">
          1
        </div>
        <hr className="md:w-24 w-10 border-t border-dashed border-green-500/50" />
        <div className="border  border-green-500/50 border-dashed text-muted-foreground w-6 h-6 flex items-center justify-center text-xs font-semibold">
          2
        </div>
        <hr className="md:w-24 w-10 border-t border-dashed border-green-500/50" />
        <div className="border border-green-500/50 border-dashed  w-6 h-6 flex items-center justify-center text-xs font-semibold">
          3
        </div>
        <hr className="md:w-24 w-10 border-t border-dashed border-green-500/50" />
        <div className="border border-green-500/50 border-dashed w-6 h-6 flex items-center justify-center text-xs font-semibold">
          <IconCheck size={14} />
        </div>
      </div>
    </div>
  );
}

export function CreateAgentForm() {
  const [step, setStep] = React.useState(1);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      walletAddress: "",
      privateKey: "",
      geminiKey: "",
      name: "",
      description: "",
      contractAddress: "",
      image: "",
      creatorAddress: "",
      systemPrompt: "",
      tasksCompleted: 0,
      tasksRan: 0,
      tasks: [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  function nextStep() {
    if (step >= 4) return;
    setStep((prev) => prev + 1);
  }

  function prevStep() {
    if (step <= 1) return;
    setStep((prev) => prev - 1);
  }

  if (step === 1) {
    return <StepOne nextStep={nextStep} />;
  }
  if (step === 2) {
    return <StepTwo nextStep={nextStep} />;
  }
  if (step === 3) {
    return <StepThree nextStep={nextStep} />;
  }
  if (step === 4) {
    return <StepFour nextStep={nextStep} />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="walletAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wallet Address</FormLabel>
              <FormControl>
                <Input placeholder="0x1234..." {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
