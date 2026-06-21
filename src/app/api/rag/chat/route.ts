import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { chatWithCollection } from "@/lib/rag/chat";
import { resolveAllowedModelId } from "@/lib/models";

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

    // Premium-gate the answer model: non-premium (or signed-out) requests
    // fall back to the default model regardless of what was requested.
    const session = await auth.api
      .getSession({ headers: await headers() })
      .catch(() => null);
    const isPremiumUser = Boolean(
      (session?.user as { isPremiumUser?: boolean } | undefined)?.isPremiumUser
    );
    const model = resolveAllowedModelId(
      typeof body?.model === "string" ? body.model : undefined,
      isPremiumUser
    );

    const chatResponse = await chatWithCollection(
      userQuery.trim(),
      collectionName,
      chatHistory,
      model
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