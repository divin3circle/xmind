import {
  IconPlus,
  IconBrandDatabricks,
  IconBrandGithub,
  IconBrandGoogle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Connect from "@/components/ui/connect";

function GetStarted() {
  return (
    <div className="max-w-7xl relative mx-auto my-0 flex items-center h-screen w-screen justify-center">
      <div className="mx-4 border mt-8 relative border-dashed p-4 min-w-sm">
        <IconPlus className="absolute -top-3 -right-3" color="gray" />
        <IconPlus className="absolute -top-3 -left-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -right-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -left-3" color="gray" />
        <div className="flex items-center gap-2">
          <IconBrandDatabricks size={32} color="green" />
          <h1 className="text-2xl font-bold font-sans text-left">bazaar</h1>
        </div>
        <p className="text-muted-foreground font-mono text-xs max-w-xs leading-relaxed">
          Create and Deploy Agents that perform tasks autonomously on Cronos.
        </p>
        <div className="mt-8">
          <Connect />
        </div>
        <p className="my-8 text-xs text-muted-foreground font-mono font-semibold text-center">
          Or Continue with
        </p>
        <div className="mt-8 flex flex-col gap-4 mb-4">
          <Button
            className=" w-full flex h-8 text-muted-foreground font-semibold border-green-500 border-dashed font-mono"
            variant="outline"
          >
            Github <IconBrandGithub className="ml-2" />
          </Button>
          <Button
            className=" w-full flex h-8 text-muted-foreground font-semibold border-green-500 border-dashed font-mono"
            variant="outline"
          >
            Google <IconBrandGoogle className="ml-2" />
          </Button>
        </div>
      </div>
      <p className="absolute bottom-1 text-xs text-muted-foreground font-sans font-light">
        all rights reserved &copy; bazaar 2024
      </p>
    </div>
  );
}

export default GetStarted;
