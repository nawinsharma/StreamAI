import { addMemoryAction } from "@/app/actions/memories";
import { mem0Client, MemoryApiResponse } from "@/lib/memory";
import prisma from "./prisma";

export interface UserPersonalDetails {
  id: string;
  name?: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Check if user has any existing memories (indicating they've used the system before)
 */
export async function hasExistingMemories(userId: string): Promise<boolean> {
  try {
    // First check if user has any messages in the database
    const messageCount = await prisma.message.count({
      where: { 
        chatId: {
          in: await prisma.chat.findMany({
            where: { userId },
            select: { id: true }
          }).then(chats => chats.map(c => c.id))
        }
      }
    });
    
    if (messageCount > 0) {
      console.log(`User has ${messageCount} existing messages in database`);
      return true;
    }

    // Also check if user has any memories in MEM0
    if (mem0Client) {
      try {
        const response = (await mem0Client.getAll({
          user_id: userId,
        })) as MemoryApiResponse[];

        if (response.length > 0) {
          console.log(`User has ${response.length} existing memories in MEM0`);
          return true;
        }
      } catch (error) {
        console.warn("Could not check MEM0 memories:", error);
        // Continue with database check only
      }
    }
    
    console.log("No existing memories found - this appears to be first-time login");
    return false;
  } catch (error) {
    console.error("Error checking existing memories:", error);
    return false;
  }
}

/**
 * Store user personal details to memory on first-time login
 */
export async function storeUserPersonalDetails(user: UserPersonalDetails): Promise<void> {
  try {
    if (!process.env.MEM0_API_KEY) {
      console.warn("MEM0_API_KEY not available - skipping user details storage");
      return;
    }

    console.log("=== Storing User Personal Details to Memory ===");
    console.log("User:", user.name || user.email);

    // Create a simple user profile memory with only name and email
    const userProfileContent = [
      `User Profile:`,
      `Name: ${user.name || "Not provided"}`,
      `Email: ${user.email}`,
    ].join("\n");

    // Store the memory using server action
    const result = await addMemoryAction({
      text: userProfileContent,
      options: {
        chatId: "user-profile", // Special chat ID for user profile memories
        metadata: {
          type: "user_profile",
          timestamp: new Date().toISOString(),
          isFirstLogin: true,
          userEmail: user.email,
          userName: user.name,
          userCreatedAt: user.createdAt.toISOString(),
        },
      },
    });

    if (result.success) {
      console.log("=== User Personal Details Stored Successfully ===");
      console.log("Stored user profile with name and email");
    } else {
      console.error("Failed to store user details:", result.error);
    }
  } catch (error) {
    console.error("Error storing user personal details:", error);
  }
}

/**
 * Check if this is user's first login and store personal details if needed
 */
export async function handleFirstTimeLogin(user: UserPersonalDetails): Promise<void> {
  try {
    const hasMemories = await hasExistingMemories(user.id);
    
    if (!hasMemories) {
      console.log("First-time login detected for user:", user.email);
      await storeUserPersonalDetails(user);
    } else {
      console.log("Returning user detected:", user.email);
    }
  } catch (error) {
    console.error("Error handling first-time login:", error);
  }
} 