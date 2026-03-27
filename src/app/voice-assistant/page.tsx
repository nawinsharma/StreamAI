"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Loader2, VolumeX } from "lucide-react";
import { VoiceSelector } from "@/components/voice-selector";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const LANGUAGES = [
  { code: "unknown", name: "Auto-detect" },
  { code: "hi-IN", name: "Hindi" },
  { code: "en-IN", name: "English" },
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

// Voice selection is now handled by VoiceSelector component

export default function VoiceAssistantPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [languageCode, setLanguageCode] = useState("unknown");
  const [speaker, setSpeaker] = useState("anushka"); // Female voice as default
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = "";
      }
    };
  }, [currentAudio]);

  const startRecording = async () => {
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Microphone access is not supported in this browser.");
        return;
      }

      // Check permissions
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permissionStatus.state === 'denied') {
          console.error("Microphone permission denied. Please enable it in your browser settings.");
          return;
        }
      } catch {
        // Permissions API might not be available, continue anyway
        console.log("Permissions API not available, continuing...");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Check if MediaRecorder is supported
      if (!MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        // Fallback to default mimeType
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
      } else {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus",
        });
        mediaRecorderRef.current = mediaRecorder;
      }
      
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      // Recording started
    } catch (error: unknown) {
      console.error("Error starting recording:", error);
      
      let errorMessage = "Failed to access microphone. ";
      const errorObj = error instanceof Error ? error : new Error(String(error));
      if (errorObj.name === "NotAllowedError" || errorObj.name === "PermissionDeniedError") {
        errorMessage += "Please allow microphone access in your browser settings and reload the page.";
      } else if (errorObj.name === "NotFoundError" || errorObj.name === "DevicesNotFoundError") {
        errorMessage += "No microphone found. Please connect a microphone.";
      } else if (errorObj.name === "NotReadableError" || errorObj.name === "TrackStartError") {
        errorMessage += "Microphone is already in use by another application.";
      } else {
        errorMessage += "Please check your browser permissions.";
      }
      console.error(errorMessage);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Convert webm to wav format for better compatibility
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("language_code", languageCode);
      formData.append("speaker", speaker);
      formData.append("chat_history", JSON.stringify(chatHistory));

      const response = await fetch("/api/sarvam/voice-chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process voice chat");
      }

      const data = await response.json();
      
      // Add messages to chat
      const userMessage: Message = {
        role: "user",
        content: data.transcript,
        timestamp: new Date(),
      };
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage, assistantMessage]);
      setChatHistory(data.chat_history || []);

      // Play audio response
      if (data.audio) {
        await playAudio(data.audio);
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      // Swallow UI notification, errors are logged in console
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = async (base64Audio: string) => {
    try {
      // Stop current audio if playing
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = "";
      }

      // Decode base64 audio - handle both standard and URL-safe base64
      let binaryString: string;
      try {
        binaryString = atob(base64Audio);
      } catch {
        // Try URL-safe base64 decoding
        const urlSafeBase64 = base64Audio.replace(/-/g, '+').replace(/_/g, '/');
        binaryString = atob(urlSafeBase64);
      }

      const arrayBuffer = new ArrayBuffer(binaryString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([arrayBuffer], { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(blob);
      
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);
      setIsPlaying(true);

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = "";
      setIsPlaying(false);
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Voice Assistant</h1>
            <p className="text-muted-foreground">
              Speak to AI and get voice responses powered by Sarvam AI
            </p>
          </div>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure language and voice preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <select
                  value={languageCode}
                  onChange={(e) => setLanguageCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  disabled={isRecording || isProcessing}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Voice</label>
                <VoiceSelector
                  value={speaker}
                  defaultValue="anushka"
                  onValueChange={setSpeaker}
                  disabled={isRecording || isProcessing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Voice Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Voice Controls</CardTitle>
              <CardDescription>Record your message and get AI voice response</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  size="lg"
                  className={`w-20 h-20 rounded-full ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="w-8 h-8" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </Button>
                {isProcessing && (
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                )}
                {isPlaying && (
                  <Button
                    onClick={stopAudio}
                    variant="outline"
                    size="lg"
                    className="w-20 h-20 rounded-full"
                  >
                    <VolumeX className="w-8 h-8" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {isRecording
                  ? "Recording... Click again to stop"
                  : isProcessing
                  ? "Processing your message..."
                  : "Click the microphone to start recording"}
              </p>
            </CardContent>
          </Card>

          {/* Chat History */}
          {messages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Conversation</CardTitle>
                <CardDescription>Your voice chat history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === "user"
                            ? "bg-purple-600 text-white"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
