import { NextRequest, NextResponse } from "next/server";
import { chatWithCollection } from "@/lib/rag/chat";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userQuery, collectionName, chatHistory } = body;

    if (!userQuery || !collectionName) {
      return NextResponse.json(
        { error: "User query and collection name are required" },
        { status: 400 }
      );
    }

    if (typeof userQuery !== "string" || userQuery.trim().length === 0) {
      return NextResponse.json(
        { error: "User query must be a non-empty string" },
        { status: 400 }
      );
    }

    // Process the chat request
    const chatResponse = await chatWithCollection(
      userQuery.trim(),
      collectionName,
      chatHistory
    );

    return NextResponse.json(
      {
        success: true,
        message: "Chat response generated successfully",
        response: chatResponse.response,
        sources: chatResponse.sources,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("RAG chat error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to process chat request" 
      },
      { status: 500 }
    );
  }
} 