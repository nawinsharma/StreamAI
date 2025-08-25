import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching chats - Request started');
    
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      console.log('Unauthorized access attempt in GET /api/chats');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(` User authenticated: ${session.user.id}`);

    const chats = await prisma.chat.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    console.log(`✅ Found ${chats.length} chats for user ${session.user.id}`);

    return NextResponse.json(chats);
  } catch (error) {
    console.error("❌ Error fetching chats:", error);
    
    // Add more specific error handling
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('connection')) {
        return NextResponse.json(
          { error: "Database connection error" },
          { status: 503 }
        );
      }
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: "Request timeout" },
          { status: 408 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Creating chat - Request started');
    
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      console.log('❌ Unauthorized access attempt in POST /api/chats');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`✅ User authenticated: ${session.user.id}`);

    const { title } = await request.json();

    if (!title) {
      console.log('❌ Missing title in chat creation request');
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const chat = await prisma.chat.create({
      data: {
        title,
        userId: session.user.id,
      },
      include: {
        messages: true,
      },
    });

    console.log(`✅ Chat created successfully: ${chat.id}`);

    return NextResponse.json(chat);
  } catch (error) {
    console.error("❌ Error creating chat:", error);
    
    // Add more specific error handling
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('connection')) {
        return NextResponse.json(
          { error: "Database connection error" },
          { status: 503 }
        );
      }
      if (error.message.includes('unique constraint')) {
        return NextResponse.json(
          { error: "Chat with this title already exists" },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
} 