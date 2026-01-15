import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import Image from "next/image";

function Earnings() {
  return (
    <div className="mt-8 px-2 flex flex-col md:flex-row gap-4 justify-center">
      <div className="w-full md:w-75 border overflow-hidden relative border-dashed p-4">
        <IconPlus className="absolute -top-3 -right-3" color="gray" />
        <IconPlus className="absolute -top-3 -left-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -right-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -left-3" color="gray" />
        <div className="flex w-full items-center justify-between">
          <h1 className="font-sans font-semibold text-sm">Earnings</h1>
          <Button className="font-sans border-dashed">+17.8%</Button>
        </div>
        <div className="mt-4">
          <h1 className="font-sans text-foreground/90 font-bold text-4xl text-center">
            $1,245.67
          </h1>
          <div className="flex w-full mt-4 items-center justify-between">
            <h1 className="font-sans text-xs font-semibold text-muted-foreground">
              Total Earned
            </h1>
            <p className="font-sans text-xs font-semibold text-muted-foreground">
              $14,686.97
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
      <div className="w-full md:w-75 border overflow-hidden relative border-dashed p-4">
        <IconPlus className="absolute -top-3 -right-3" color="gray" />
        <IconPlus className="absolute -top-3 -left-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -right-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -left-3" color="gray" />
        <div className="flex w-full items-center justify-between py-2">
          <h1 className="font-sans font-semibold text-sm">Withdrawals</h1>
        </div>
        <div className="mt-4">
          <h1 className="font-sans text-foreground/90 font-bold text-4xl text-center">
            $245.43
          </h1>
          <div className="flex w-full mt-4 items-center justify-between">
            <h1 className="font-sans text-xs font-semibold text-muted-foreground">
              Total Withdrawn
            </h1>
            <p className="font-sans text-xs font-semibold text-muted-foreground">
              $4,686.97
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
      <div className="flex items-center justify-between w-full md:w-125 border overflow-hidden relative border-dashed p-4">
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
          <Button className="mt-4 font-sans border-dashed">Create Agent</Button>
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
