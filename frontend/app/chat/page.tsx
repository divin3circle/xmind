"use client";
import { TemplateSelectorCard } from "@/components/template-card";
import DashboardNavbar from "../dashboard/navbar";
import { useTemplates } from "@/hooks/useTemplates";
import { IconLoader2 } from "@tabler/icons-react";

function ChatPage() {
  const {
    templates,
    loading: templatesLoading,
    error: templatesError,
  } = useTemplates();
  return (
    <div className="max-w-7xl mx-auto my-0">
      <DashboardNavbar />
      <div className="h-[90vh] flex items-center justify-center flex-col px-4">
        <h1 className="text-2xl font-bold font-sans">Welcome to xMind Chat</h1>
        <p className="text-muted-foreground font-sans text-sm">
          What would you like to do today?
        </p>
        <h1 className="mt-12 font-semibold font-sans text-muted-foreground text-sm">
          Start with a template:
        </h1>
        <div className="flex flex-wrap gap-4 mt-2  max-w-4xl">
          {templates &&
            !templatesLoading &&
            !templatesError &&
            templates.map((template) => (
              <TemplateSelectorCard key={template._id} template={template} />
            ))}
          {templatesLoading && (
            <IconLoader2 className="animate-spin text-muted-foreground mx-auto" />
          )}
          {templatesError && !templatesLoading && (
            <p className="text-red-500 font-sans">
              Error loading agents: {templatesError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
