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
  IconBellPlus,
  IconCopy,
  IconInfoCircle,
  IconWallet,
} from "@tabler/icons-react";
import { StepIndicator } from "@/components/step-indicator";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { set } from "mongoose";

interface CreatedWallet {
  walletAddress: string;
  privateKey: string;
}

interface Task {
  task: string;
  duration: string;
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

function StepOne({
  nextStep,
  goToStep,
}: {
  nextStep: () => void;
  goToStep: (step: number) => void;
}) {
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
          <StepIndicator
            currentStep={1}
            totalSteps={5}
            onStepClick={goToStep}
          />
        </div>
      )}
    </>
  );
}

function StepTwo({
  nextStep,
  goToStep,
}: {
  nextStep: () => void;
  goToStep: (step: number) => void;
}) {
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
      <StepIndicator currentStep={2} totalSteps={5} onStepClick={goToStep} />
    </div>
  );
}

function StepThree({
  nextStep,
  goToStep,
}: {
  nextStep: () => void;
  goToStep: (step: number) => void;
}) {
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
      <StepIndicator currentStep={3} totalSteps={5} onStepClick={goToStep} />
    </div>
  );
}

function StepFive({
  submitDetails,
  values,
  goToStep,
}: {
  submitDetails: (values: z.infer<typeof formSchema>) => void;
  values: z.infer<typeof formSchema>;
  goToStep: (step: number) => void;
}) {
  const handleNext = () => {
    // set relevant form values here if needed
    submitDetails(values);
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
      <StepIndicator currentStep={5} totalSteps={5} onStepClick={goToStep} />
    </div>
  );
}

function StepFour({
  nextStep,
  goToStep,
}: {
  nextStep: () => void;
  goToStep: (step: number) => void;
}) {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [task, setTask] = React.useState("");
  const [duration, setDuration] = React.useState<string>("Every 3 Minutes");

  const handleAddTask = () => {
    setTasks([...tasks, { task, duration }]);
    setTask("");
    setDuration("");
  };

  const handleNext = () => {
    if (tasks.length > 0) {
      // set relevant form values here if needed
      nextStep();
    }
  };
  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <div>
        <h1 className="text-sm font-semibold text-center">Agentic Tasks </h1>
        <p className="text-center text-[11px] text-muted-foreground max-w-md">
          Tasks are the power house behind autonomous agents. Define what you
          want done when you want it done, and let your agent handle the rest.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-wrap gap-2 my-4 w-full justify-center">
          {tasks.length === 0 && (
            <p className="text-xs text-center text-muted-foreground">
              No tasks added yet. Please add tasks to below.
            </p>
          )}
          {tasks.map((task, index) => (
            <div
              key={index}
              onClick={() => {
                //remove
                setTasks(tasks.filter((t) => t.task !== task.task));
              }}
              className="border border-dashed p-2 hover:bg-green-500/10 cursor-pointer hover:border-green-500/50 flex flex-col gap-1"
            >
              <p className="text-sm font-semibold">
                {task.task.slice(0, 20)}
                {task.task.length > 20 ? "..." : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                Schedule: {task.duration}
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row mt-8 gap-1 items-center justify-center">
          <div className="w-full max-w-sm md:w-3/4">
            <Input
              placeholder={"Make payments to this address: 0x1234..."}
              className="bg-background"
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
          </div>
          <Select onValueChange={(value) => setDuration(value)}>
            <SelectTrigger className="w-full md:w-1/4 border border-dashed">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Duration</SelectLabel>
                <SelectItem value="Every 3 Minutes">Every 3 Minutes</SelectItem>
                <SelectItem value="Every 15 Minutes">
                  Every 15 Minutes
                </SelectItem>
                <SelectItem value="Every 1 Hour">Every 1 Hour</SelectItem>
                <SelectItem value="Every 4 Hours">Every 4 Hours</SelectItem>
                <SelectItem value="Every 12 Hours">Every 12 Hours</SelectItem>
                <SelectItem value="Every 24 Hours">Every 24 Hours</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex mt-2 items-center justify-center">
          <Button
            className="font-sans flex items-center justify-center gap-1"
            onClick={handleAddTask}
            size="sm"
            disabled={tasks.length >= 2}
          >
            Add
            <IconBellPlus className="size-4" />
          </Button>
        </div>
      </div>
      <Button
        className="w-full mt-8 md:w-1/2 border-green-500 border-dashed font-sans"
        variant="outline"
        onClick={handleNext}
        disabled={tasks.length === 0}
      >
        Next
      </Button>
      <StepIndicator currentStep={4} totalSteps={5} onStepClick={goToStep} />
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
    if (step >= 5) return;
    setStep((prev) => prev + 1);
  }

  function prevStep() {
    if (step <= 1) return;
    setStep((prev) => prev - 1);
  }

  function goToStep(stepNumber: number) {
    if (stepNumber < 1 || stepNumber > 5) return;
    setStep(stepNumber);
  }

  if (step === 1) {
    return <StepOne nextStep={nextStep} goToStep={goToStep} />;
  }
  if (step === 2) {
    return <StepTwo nextStep={nextStep} goToStep={goToStep} />;
  }
  if (step === 3) {
    return <StepThree nextStep={nextStep} goToStep={goToStep} />;
  }
  if (step === 4) {
    return <StepFour nextStep={nextStep} goToStep={goToStep} />;
  }
  if (step === 5) {
    return (
      <StepFive
        submitDetails={onSubmit}
        values={form.getValues()}
        goToStep={goToStep}
      />
    );
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
