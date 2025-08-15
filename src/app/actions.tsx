import { CoreMessage, generateId, streamText } from "ai";
import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { google } from "@ai-sdk/google";

interface InputProps {
  prompt: string;
  file?: {
    base64: string;
  };
  chatId?: string;
  attachmentMeta?: { name: string; mimeType: string; url: string; type: 'image' | 'file'; width?: number | null; height?: number | null };
  attachmentText?: string;
}

const convertChatHistoryToMessage = (chat_history: CoreMessage[]) =>
  chat_history.map(({ role, content }) => {
    return {
      role: role === "user" ? "user" : "assistant",
      content: content as string,
    };
  });

function processFile(input: InputProps, chat_history: CoreMessage[]) {
  // Handle image attachments for vision analysis
  if (input.attachmentMeta && input.attachmentMeta.type === 'image') {
    const imageMessage = {
      role: "user" as const,
      content: [
        {
          type: "image_url" as const,
          image_url: {
            url: input.attachmentMeta.url,
          },
        },
        {
          type: "text" as const,
          text: input.attachmentText
            ? `${input.prompt}\n\nContext from attached file (truncated):\n${input.attachmentText}`
            : input.prompt,
        },
      ],
    };

    return {
      messages: [
        ...convertChatHistoryToMessage(chat_history),
        imageMessage,
      ],
    };
  }
  
  // Handle legacy file input (base64)
  if (input.file) {
    const imageMessage = {
      role: "user" as const,
      content: [
        {
          type: "image_url" as const,
          image_url: {
            url: `data:image/jpeg;base64,${input.file.base64}`,
          },
        },
        {
          type: "text" as const,
          text: input.prompt,
        },
      ],
    };

    return {
      messages: [
        ...convertChatHistoryToMessage(chat_history),
        imageMessage,
      ],
    };
  }

  // Regular text message
  return {
    messages: [
      ...convertChatHistoryToMessage(chat_history),
      {
        role: "user" as const,
        content: input.prompt,
      },
    ],
  };
}

// Simple state management for messages
let messageState: CoreMessage[] = [];

async function sendMessage(input: InputProps) {
  "use server";

  console.log("=== SENDMESSAGE CALLED ===");
  console.log("Input received:", input);
  console.log("ChatId:", input.chatId);
  console.log("Prompt:", input.prompt);

  try {
    const processInputs = processFile(input, messageState);
    console.log("=== PROCESSING INPUTS ===");
    console.log("Processed inputs:", processInputs);
    
    // Use Google AI with streaming
    const result = await streamText({
      model: google('gemini-1.5-flash') as any,
      messages: processInputs.messages as any,
      temperature: 0.7,
      providerOptions: {
        google: {
          maxOutputTokens: 4000,
          safetySettings: [
            {
              category: 'HARM_CATEGORY_UNSPECIFIED',
              threshold: 'BLOCK_LOW_AND_ABOVE',
            },
          ],
        },
      },
    });

    // Get final text for database storage
    const finalText = await result.text;
    
    // Save messages to database if user is authenticated and chatId is provided
    if (input.chatId) {
      try {
        const session = await auth.api.getSession({
          headers: await headers()
        });
        
        if (session?.user?.id) {
          console.log("=== SAVING MODEL RESPONSE TO DB ===");
          
          // Save user message
          const userContent = input.attachmentMeta 
            ? `${input.prompt}\n${JSON.stringify(input.attachmentMeta)}`
            : input.prompt;
            
          await prisma.message.create({
            data: {
              content: userContent,
              role: "user",
              chatId: input.chatId,
            },
          });

          // Save AI response
          await prisma.message.create({
            data: {
              content: finalText,
              role: "assistant",
              chatId: input.chatId,
            },
          });

          // Update chat's updatedAt timestamp and title if it's the first message
          await prisma.chat.update({
            where: { id: input.chatId },
            data: { 
              updatedAt: new Date(),
              title: input.prompt.substring(0, 50) + (input.prompt.length > 50 ? "..." : "")
            },
          });
          console.log("=== MODEL RESPONSE SAVED SUCCESSFULLY ===");
        }
      } catch (error) {
        console.error("Error saving messages to database:", error);
      }
    }

    // Update message state
    messageState = [
      ...messageState,
      { role: "user", content: input.prompt },
      { role: "assistant", content: finalText },
    ];

    return { ui: finalText };
  } catch (error) {
    console.error("Error in sendMessage:", error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    messageState = [
      ...messageState,
      { role: "user", content: input.prompt },
      { role: "assistant", content: `I encountered an error: ${errorMessage}` },
    ];
    
    // Return a simple UI for error cases
    return { ui: `I encountered an error: ${errorMessage}` };
  }
}

export type UIState = Array<ReactNode>;

export type AIState = {
  chatId: string;
  messages: Array<CoreMessage>;
};

// Export the sendMessage function for use in the app
export { sendMessage };
