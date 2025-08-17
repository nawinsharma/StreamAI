import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { handleFirstTimeLogin } from "@/lib/user-memory";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if this is the user's first login and store personal details
    await handleFirstTimeLogin({
      id: session.user.id,
      name: session.user.name || undefined,
      email: session.user.email,
      emailVerified: session.user.emailVerified,
      image: session.user.image || null,
      createdAt: session.user.createdAt,
      updatedAt: session.user.updatedAt,
    });

    return NextResponse.json({ 
      success: true, 
      message: "First-time login processed successfully" 
    });
  } catch (error) {
    console.error("Error processing first-time login:", error);
    return NextResponse.json(
      { error: "Failed to process first-time login" },
      { status: 500 }
    );
  }
} 