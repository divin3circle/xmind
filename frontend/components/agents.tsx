"use client";
import { IconChevronsDown, IconLoader2, IconPlus } from "@tabler/icons-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useTemplates } from "@/hooks/useTemplates";
import TemplateCard from "./template-card";

function Agents() {
  const { loading, error, templates } = useTemplates();

  return (
    <section className="my-24">
      <div className="py-8 mx-4 border mt-8 relative border-dashed px-4 overflow-hidden">
        <IconPlus className="absolute -top-3 -right-3" color="gray" />
        <IconPlus className="absolute -top-3 -left-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -right-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -left-3" color="gray" />

        <h1 className="text-xl font-bold font-sans text-left">
          Available Templates
        </h1>
        <p className="text-muted-foreground text-xs font-sans max-w-md leading-relaxed mt-1">
          These are our MCP AI Agent personalities, that you can base your
          creation off.
        </p>
        <div className="flex items-center justify-between flex-col md:flex-row mt-4">
          <Input
            className="w-full font-sans md:w-1/4 h-10"
            placeholder="Find a personality template"
          />
          <div className="mt-4 md:mt-0 font-sans text-xs text-muted-foreground flex items-center justify-between w-full md:w-auto">
            <Button
              variant="outline"
              className="border border-dashed font-semibold flex h-10 items-center gap-2 w-1/3 md:w-auto"
            >
              Reputation <IconChevronsDown />
            </Button>
            <Button
              variant="outline"
              className="border border-dashed font-semibold flex items-center gap-2 h-10 w-1/3 md:w-auto"
            >
              Tasks <IconChevronsDown />
            </Button>
            <Button
              variant="outline"
              className="border border-dashed font-semibold flex items-center gap-2 h-10 w-1/3 md:w-auto"
            >
              Revenue <IconChevronsDown />
            </Button>
          </div>
        </div>

        {loading && <IconLoader2 className="mt-8 mx-auto animate-spin" />}
        {error && (
          <p className="mt-8 text-center text-red-500">Error: {error}</p>
        )}
        {!loading && !error && (
          <div className="flex flex-wrap gap-4 mt-8 ">
            {templates.map((template) => (
              <TemplateCard key={template._id} template={template} />
            ))}
          </div>
        )}
      </div>
      <div className="px-4">
        <Button
          variant="outline"
          className="mt-8 w-full max-w-md mx-auto flex items-center gap-2 border-dashed border"
        >
          See More <IconChevronsDown />
        </Button>
      </div>
    </section>
  );
}

export default Agents;
