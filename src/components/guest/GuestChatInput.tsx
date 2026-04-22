import { useEffect, useId, useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface GuestChatInputProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  placeholder: string;
  submitLabel: string;
  loadingLabel?: string;
  disabled?: boolean;
  isSubmitting?: boolean;
  onSubmit: (value: string) => void;
}

export function GuestChatInput({
  value,
  onValueChange,
  defaultValue = "",
  placeholder,
  submitLabel,
  loadingLabel = "Working…",
  disabled = false,
  isSubmitting = false,
  onSubmit,
}: GuestChatInputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const textareaId = useId();
  const controlled = value != null;
  const currentValue = controlled ? value : internalValue;
  const maxHeight = 96;

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    const textarea = textareaRef.current;
    textarea.style.height = "0px";

    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [currentValue, maxHeight]);

  const handleChange = (nextValue: string) => {
    if (controlled) {
      onValueChange?.(nextValue);
      return;
    }

    setInternalValue(nextValue);
  };

  const handleSubmit = () => {
    const trimmed = currentValue.trim();
    if (!trimmed || disabled || isSubmitting) {
      return;
    }

    onSubmit(trimmed);

    if (!controlled) {
      setInternalValue("");
    }
  };

  return (
    <div className="rounded-[28px] border border-border/80 bg-card p-3 shadow-sm">
      <div className="flex items-end gap-3">
        <label htmlFor={textareaId} className="sr-only">
          {placeholder}
        </label>
        <Textarea
          id={textareaId}
          ref={textareaRef}
          value={currentValue}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={placeholder}
          disabled={disabled || isSubmitting}
          rows={1}
          className="min-h-[24px] max-h-[96px] flex-1 resize-none overflow-y-hidden border-0 bg-transparent py-1 text-sm leading-6 shadow-none focus-visible:ring-0"
        />
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || isSubmitting || !currentValue.trim()}
          className="h-9 shrink-0 rounded-xl px-4"
        >
          <SendHorizonal className="mr-2 h-4 w-4" />
          {isSubmitting ? loadingLabel : submitLabel}
        </Button>
      </div>
    </div>
  );
}
