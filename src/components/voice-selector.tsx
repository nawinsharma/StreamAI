"use client";

import * as React from "react";
import { Check, Loader2, Mars, Play, Square, Venus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
    id: "abhilash",
    name: "Abhilash",
    gender: "male",
    description: "Deep and confident",
  },
  {
    id: "arya",
    name: "Arya",
    gender: "male",
    description: "Neutral and smooth",
  },
  {
    id: "karun",
    name: "Karun",
    gender: "male",
    description: "Warm and expressive",
  },
  {
    id: "hitesh",
    name: "Hitesh",
    gender: "male",
    description: "Clear and engaging",
  },
];

interface VoiceSelectorProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  languageCode?: string;
}

export function VoiceSelector({
  value,
  defaultValue = "anushka", // Female voice as default
  onValueChange,
  disabled = false,
  languageCode = "unknown",
}: VoiceSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue);
  const [previewLoadingVoice, setPreviewLoadingVoice] = React.useState<string | null>(null);
  const [playingVoice, setPlayingVoice] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  React.useEffect(() => {
    if (!SARVAM_VOICES.some((voice) => voice.id === selectedValue)) {
      setSelectedValue(defaultValue);
      onValueChange?.(defaultValue);
    }
  }, [defaultValue, onValueChange, selectedValue]);

  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const handleSelect = React.useCallback((voiceId: string) => {
    if (SARVAM_VOICES.some(v => v.id === voiceId)) {
      setSelectedValue(voiceId);
      onValueChange?.(voiceId);
      setOpen(false);
    }
  }, [onValueChange]);

  const stopPreview = React.useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setPlayingVoice(null);
  }, []);

  const playPreview = React.useCallback(
    async (voiceId: string) => {
      if (disabled) return;
      if (playingVoice === voiceId) {
        stopPreview();
        return;
      }

      try {
        setPreviewLoadingVoice(voiceId);
        stopPreview();

        const response = await fetch("/api/sarvam/voice-preview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            speaker: voiceId,
            language_code: languageCode,
          }),
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (!data.audio) {
          return;
        }

        const binaryString = atob(data.audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const audioBlob = new Blob([bytes], { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        setPlayingVoice(voiceId);

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          if (audioRef.current === audio) {
            audioRef.current = null;
          }
          setPlayingVoice(null);
        };

        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          if (audioRef.current === audio) {
            audioRef.current = null;
          }
          setPlayingVoice(null);
        };

        await audio.play();
      } catch {
        setPlayingVoice(null);
      } finally {
        setPreviewLoadingVoice(null);
      }
    },
    [disabled, languageCode, playingVoice, stopPreview]
  );

  const selectedVoice = SARVAM_VOICES.find((voice) => voice.id === selectedValue);
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
          <div className="flex items-center gap-2 min-w-0">
            {selectedVoice?.gender === "female" ? (
              <Venus className="h-4 w-4 text-pink-500 shrink-0" />
            ) : (
              <Mars className="h-4 w-4 text-blue-500 shrink-0" />
            )}
            <span className="truncate">
              {selectedVoice ? `${selectedVoice.name} (${selectedVoice.description})` : "Select voice"}
            </span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Select Voice</DialogTitle>
          <DialogDescription>
            Showing reliable Sarvam speakers only. Select one and preview before using it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Female Voices</p>
            {femaleVoices.map((voice) => {
              const isSelected = selectedValue === voice.id;
              const isLoading = previewLoadingVoice === voice.id;
              const isPlaying = playingVoice === voice.id;
              return (
                <div
                  key={voice.id}
                  className={cn(
                    "w-full rounded-md border px-3 py-2 transition-colors",
                    "flex items-center gap-3",
                    isSelected ? "border-purple-600 bg-purple-50/40" : "border-border"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(voice.id)}
                    disabled={disabled}
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-3 text-left",
                      disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                    )}
                    aria-pressed={isSelected}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border",
                        isSelected ? "border-purple-600 bg-purple-600 text-white" : "border-muted-foreground/40"
                      )}
                    >
                      <Check className={cn("h-3 w-3", isSelected ? "opacity-100" : "opacity-0")} />
                    </span>
                    <Venus className="h-4 w-4 text-pink-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium leading-none">{voice.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{voice.description}</div>
                    </div>
                  </button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => playPreview(voice.id)}
                    disabled={disabled || isLoading}
                    className="shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isPlaying ? (
                      <Square className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Male Voices</p>
            {maleVoices.map((voice) => {
              const isSelected = selectedValue === voice.id;
              const isLoading = previewLoadingVoice === voice.id;
              const isPlaying = playingVoice === voice.id;
              return (
                <div
                  key={voice.id}
                  className={cn(
                    "w-full rounded-md border px-3 py-2 transition-colors",
                    "flex items-center gap-3",
                    isSelected ? "border-purple-600 bg-purple-50/40" : "border-border"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(voice.id)}
                    disabled={disabled}
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-3 text-left",
                      disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                    )}
                    aria-pressed={isSelected}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border",
                        isSelected ? "border-purple-600 bg-purple-600 text-white" : "border-muted-foreground/40"
                      )}
                    >
                      <Check className={cn("h-3 w-3", isSelected ? "opacity-100" : "opacity-0")} />
                    </span>
                    <Mars className="h-4 w-4 text-blue-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium leading-none">{voice.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{voice.description}</div>
                    </div>
                  </button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => playPreview(voice.id)}
                    disabled={disabled || isLoading}
                    className="shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isPlaying ? (
                      <Square className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
