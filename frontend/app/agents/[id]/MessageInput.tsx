import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconSend } from "@tabler/icons-react";

interface MessageInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export function MessageInput({
  placeholder,
  value,
  onChange,
  onSend,
  disabled,
}: MessageInputProps) {
  return (
    <div className="px-4 pb-4">
      <div className="flex gap-2">
        <div className="flex-1 border border-dashed p-1 backdrop-blur-sm">
          <Input
            placeholder={placeholder}
            className="bg-background h-10 border-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            disabled={disabled}
          />
        </div>
        <Button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          variant={value.trim().length === 0 ? "outline" : "default"}
          className="disabled:border-dashed border font-sans h-12 w-12"
        >
          <IconSend size={16} />
        </Button>
      </div>
    </div>
  );
}
