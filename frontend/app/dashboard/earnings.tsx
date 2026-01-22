"use client";
import { Button } from "@/components/ui/button";
import { useMyAgents } from "@/hooks/useMyAgents";
import { IconLoader2, IconPlus } from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function Earnings() {
  const router = useRouter();
  const { agents, loading } = useMyAgents();
  return (
    <div className="mt-8 px-2 flex flex-col md:flex-row gap-4 justify-center">
      <div className="w-full md:w-1/4 border overflow-hidden relative border-dashed p-4">
        <IconPlus className="absolute -top-3 -right-3" color="gray" />
        <IconPlus className="absolute -top-3 -left-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -right-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -left-3" color="gray" />
        <div className="flex w-full items-center justify-between">
          <h1 className="font-sans font-semibold text-sm">Balance</h1>
          <div className="flex items-center gap-1">
            <Image
              src={"/usdc.png"}
              alt="USDC Logo"
              width={20}
              height={20}
              className="rounded-full"
            />
            <p className="font-sans font-semibold text-muted-foreground text-xs">
              USDC.e
            </p>
          </div>
        </div>
        <div className="mt-4">
          <h1 className="font-sans text-foreground/90 font-bold text-4xl text-center">
            $1,245.67
          </h1>
          <div className="flex w-full mt-4 items-center justify-between">
            <h1 className="font-sans text-xs font-semibold text-muted-foreground">
              Tokens
            </h1>
            <p className="font-sans text-xs font-semibold text-muted-foreground">
              5,432.12 USDC.e
            </p>
          </div>
          <div className="flex w-full mt-2 items-center justify-between">
            <h1 className="font-sans text-xs font-semibold text-muted-foreground">
              Since
            </h1>
            <p className="font-sans text-xs font-semibold text-muted-foreground">
              January 1st 2026
            </p>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/4 border overflow-hidden relative border-dashed p-4">
        <IconPlus className="absolute -top-3 -right-3" color="gray" />
        <IconPlus className="absolute -top-3 -left-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -right-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -left-3" color="gray" />
        <div className="flex w-full items-center justify-between py-2">
          <h1 className="font-sans font-semibold text-sm">Agents</h1>
        </div>
        <div className="mt-4">
          <h1 className="font-sans text-foreground/90 font-bold text-4xl text-center">
            {loading ? (
              <span className="w-full flex items-center justify-center">
                <IconLoader2 size={16} className="animate-spin" />
              </span>
            ) : (
              agents?.length || 0
            )}
          </h1>
          <div className="flex w-full mt-4 items-center justify-between">
            <h1 className="font-sans text-xs font-semibold text-muted-foreground">
              Agents Balance
            </h1>
            <p className="font-sans text-xs font-semibold text-muted-foreground">
              4,686.97 USDC.e
            </p>
          </div>
          <div className="flex w-full mt-2 items-center justify-between">
            <h1 className="font-sans text-xs font-semibold text-muted-foreground">
              Since
            </h1>
            <p className="font-sans text-xs font-semibold text-muted-foreground">
              January 1st 2026
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between w-full md:w-1/2 border overflow-hidden relative border-dashed p-4">
        <IconPlus className="absolute -top-3 -right-3" color="gray" />
        <IconPlus className="absolute -top-3 -left-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -right-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -left-3" color="gray" />
        <div className="">
          <h1 className="font-sans font-semibold text-sm">Start Earning</h1>
          <p className="font-sans text-xs text-muted-foreground mt-2 max-w-xs">
            Create and agent for only 45 USDC and start earning rewards as they
            complete tasks on Cronos.
          </p>
          <Button
            onClick={() => router.push("/create")}
            className="mt-4 disabled:cursor-not-allowed font-sans border-dashed"
          >
            Create Agent
          </Button>
          <p className="text-xs flex items-center justify-start mt-2 gap-1 text-muted-foreground">
            <span className="text-base">[</span>
            Beta
            <span className="text-base">]</span>
          </p>
        </div>
        <Image
          src={"/currency.webp"}
          alt="Earnings Illustration"
          width={150}
          height={150}
        />
      </div>
    </div>
  );
}

export default Earnings;
