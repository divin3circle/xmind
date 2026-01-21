import { IconLoader2 } from "@tabler/icons-react";

export function LoadingScreen() {
  return (
    <div className="h-[90vh] flex items-center justify-center">
      <IconLoader2 className="animate-spin text-muted-foreground" />
    </div>
  );
}
