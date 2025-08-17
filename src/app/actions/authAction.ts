import { authClient } from "@/lib/auth-client";

export const signInWithGoogle = async () => {
   return await authClient.signIn.social({
      provider: "google"
   })
}