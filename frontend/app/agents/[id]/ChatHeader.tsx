import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  name: string;
  image: string;
  contractAddress: string;
  onExit: () => void;
}

export function ChatHeader({
  name,
  image,
  contractAddress,
  onExit,
}: ChatHeaderProps) {
  return (
    <div className="border-b border-dashed p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="border border-dashed p-1">
          <Image
            src={image}
            alt={name}
            width={40}
            height={40}
            className="w-10 h-10 object-cover"
          />
        </div>
        <div>
          <h2 className="font-sans font-semibold text-sm">{name}</h2>
          <p className="text-xs text-muted-foreground">
            {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="border-dashed"
        onClick={onExit}
      >
        Exit
      </Button>
    </div>
  );
}
