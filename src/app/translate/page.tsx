"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowRightLeft, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const LANGUAGES = [
  { code: "en-IN", name: "English" },
  { code: "hi-IN", name: "Hindi" },
  { code: "ta-IN", name: "Tamil" },
  { code: "te-IN", name: "Telugu" },
  { code: "bn-IN", name: "Bengali" },
  { code: "kn-IN", name: "Kannada" },
  { code: "ml-IN", name: "Malayalam" },
  { code: "mr-IN", name: "Marathi" },
  { code: "gu-IN", name: "Gujarati" },
  { code: "pa-IN", name: "Punjabi" },
  { code: "od-IN", name: "Odia" },
];

export default function TranslatePage() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("hi-IN");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter text to translate");
      return;
    }

    setIsTranslating(true);
    try {
      const response = await fetch("/api/sarvam/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: inputText,
          source_language_code: sourceLanguage,
          target_language_code: targetLanguage,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Translation failed");
      }

      const data = await response.json();
      setTranslatedText(data.translated_text);
      toast.success("Translation completed");
    } catch (error) {
      console.error("Translation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to translate");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLanguage === "auto") {
      toast.error("Cannot swap when source is auto-detect");
      return;
    }
    const tempSource = sourceLanguage;
    const tempTarget = targetLanguage;
    setSourceLanguage(tempTarget);
    setTargetLanguage(tempSource);
    
    // Swap texts
    const tempText = inputText;
    setInputText(translatedText);
    setTranslatedText(tempText);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const getLanguageName = (code: string) => {
    if (code === "auto") return "Auto-detect";
    return LANGUAGES.find((lang) => lang.code === code)?.name || code;
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Translate</h1>
            <p className="text-muted-foreground">
              Translate text between English and Indian languages using Sarvam AI
            </p>
          </div>

          {/* Language Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Language Selection</CardTitle>
              <CardDescription>Choose source and target languages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">From</label>
                  <select
                    value={sourceLanguage}
                    onChange={(e) => setSourceLanguage(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    disabled={isTranslating}
                  >
                    <option value="auto">Auto-detect</option>
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={handleSwapLanguages}
                  variant="outline"
                  size="icon"
                  className="mt-6"
                  disabled={isTranslating || sourceLanguage === "auto"}
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">To</label>
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    disabled={isTranslating}
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Translation Area */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Input */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{getLanguageName(sourceLanguage)}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(inputText)}
                    disabled={!inputText}
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter text to translate..."
                  className="min-h-[300px] resize-none"
                  disabled={isTranslating}
                />
              </CardContent>
            </Card>

            {/* Output */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{getLanguageName(targetLanguage)}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(translatedText)}
                    disabled={!translatedText}
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={translatedText}
                  readOnly
                  placeholder="Translated text will appear here..."
                  className="min-h-[300px] resize-none bg-muted"
                />
              </CardContent>
            </Card>
          </div>

          {/* Translate Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleTranslate}
              disabled={!inputText.trim() || isTranslating}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Translating...
                </>
              ) : (
                "Translate"
              )}
            </Button>
          </div>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>About Translation</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                • Supports translation between English and 10 Indian languages
              </p>
              <p>
                • Auto-detect language for source text
              </p>
              <p>
                • Powered by Sarvam AI&apos;s Mayura translation model
              </p>
              <p>
                • Handles code-mixed text (e.g., Hinglish)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
