"use client";

import * as React from "react";
import { Check, Venus, Mars } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface Voice {
  id: string;
  name: string;
  gender: "female" | "male";
  description: string;
}

const SARVAM_VOICES: Voice[] = [
  {
    id: "anushka",
    name: "Anushka",
    gender: "female",
    description: "General, warm tone",
  },
  {
    id: "manisha",
    name: "Manisha",
    gender: "female",
    description: "Professional, clear",
  },
  {
    id: "vidya",
    name: "Vidya",
    gender: "female",
    description: "Friendly, conversational",
  },
  {
    id: "arjun",
    name: "Arjun",
    gender: "male",
    description: "Authoritative, news",
  },
  {
    id: "amol",
    name: "Amol",
    gender: "male",
    description: "Casual, storytelling",
  },
];

interface VoiceSelectorProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

export function VoiceSelector({
  value,
  defaultValue = "anushka", // Female voice as default
  onValueChange,
  disabled = false,
}: VoiceSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue);

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const selectedVoice = SARVAM_VOICES.find((voice) => voice.id === selectedValue);

  const handleSelect = React.useCallback((voiceId: string) => {
    if (SARVAM_VOICES.some(v => v.id === voiceId)) {
      setSelectedValue(voiceId);
      onValueChange?.(voiceId);
      setOpen(false);
    }
  }, [onValueChange]);

  const femaleVoices = SARVAM_VOICES.filter((voice) => voice.gender === "female");
  const maleVoices = SARVAM_VOICES.filter((voice) => voice.gender === "male");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            {selectedVoice?.gender === "female" ? (
              <Venus className="h-4 w-4 text-pink-500" />
            ) : (
              <Mars className="h-4 w-4 text-blue-500" />
            )}
            <span>
              {selectedVoice?.name || "Select voice..."}
            </span>
            {selectedVoice && (
              <span className="text-xs text-muted-foreground ml-2">
                ({selectedVoice.description})
              </span>
            )}
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Voice</DialogTitle>
          <DialogDescription>
            Choose a voice for the AI assistant. Female voices are selected by default.
          </DialogDescription>
        </DialogHeader>
        <Command shouldFilter={true}>
          <CommandInput placeholder="Search voices..." />
          <CommandList>
            <CommandEmpty>No voice found.</CommandEmpty>
            
            <CommandGroup heading="Female Voices">
              {femaleVoices.map((voice) => (
                <CommandItem
                  key={voice.id}
                  value={`${voice.name.toLowerCase()} ${voice.description.toLowerCase()} ${voice.id}`}
                  onSelect={(currentValue) => {
                    // The onSelect receives the value prop, extract the ID
                    const parts = currentValue.split(' ');
                    const voiceId = parts[parts.length - 1];
                    handleSelect(voiceId);
                  }}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <Venus className="h-4 w-4 text-pink-500 shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">{voice.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {voice.description}
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      selectedValue === voice.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Male Voices">
              {maleVoices.map((voice) => (
                <CommandItem
                  key={voice.id}
                  value={`${voice.name.toLowerCase()} ${voice.description.toLowerCase()} ${voice.id}`}
                  onSelect={(currentValue) => {
                    // The onSelect receives the value prop, extract the ID
                    const parts = currentValue.split(' ');
                    const voiceId = parts[parts.length - 1];
                    handleSelect(voiceId);
                  }}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <Mars className="h-4 w-4 text-blue-500 shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">{voice.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {voice.description}
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      selectedValue === voice.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
