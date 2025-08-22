"use client"

import { useState } from "react"
import { signInWithGoogle } from "@/app/actions/authAction"
import { Button } from "@/components/ui/button"
import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from "@/components/ui/card"
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { signInFormSchema } from "@/lib/auth-schema"
import { processPendingData } from "@/lib/pending-messages"
import { useUserContext } from "@/context/UserContext"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { UserIcon } from "lucide-react"

interface LoginDialogProps {
   isOpen: boolean
   onClose: () => void
}

export default function LoginDialog({ isOpen }: LoginDialogProps) {
   const router = useRouter()
   const { refreshUser } = useUserContext();
   const [isLoading, setIsLoading] = useState(false)

   const form = useForm<z.infer<typeof signInFormSchema>>({
      resolver: zodResolver(signInFormSchema),
      defaultValues: {
         email: "",
         password: "",
      },
   })

   async function onSubmit(values: z.infer<typeof signInFormSchema>) {
      setIsLoading(true)
      const { email, password } = values
      
      try {
         await authClient.signIn.email({
            email,
            password,
         }, {
            onRequest: () => {
               toast("Signing in...")
            },
            onSuccess: async () => {
               form.reset()
               toast.success("Successfully signed in!")
               
               console.log('Login dialog sign-in successful, refreshing user state...');
               
               // Refresh user context first
               if (refreshUser) {
                  await refreshUser();
               }
               
               // Process pending data after successful sign-in
               const redirectUrl = await processPendingData();
               console.log('Redirect URL:', redirectUrl);
               if (redirectUrl) {
                  router.push(redirectUrl);
               } else {
                  // Instead of window.location.reload(), just refresh the router
                  router.refresh();
               }
            },
            onError: (ctx) => {
               toast.error(ctx.error.message)
            },
         })
      } catch {
         toast.error("Failed to sign in")
      } finally {
         setIsLoading(false)
      }
   }

   const handleGoogleSignIn = async () => {
      setIsLoading(true)
      try {
         await signInWithGoogle()
         
         console.log('Google sign-in successful in dialog, refreshing user state...');
         
         // Refresh user context first
         if (refreshUser) {
            await refreshUser();
         }
         
         // Process pending data after successful Google sign-in
         const redirectUrl = await processPendingData();
         console.log('Redirect URL:', redirectUrl);
         if (redirectUrl) {
            router.push(redirectUrl);
         } else {
            router.refresh();
         }
      } catch {
         toast.error("Failed to sign in with Google")
      } finally {
         setIsLoading(false)
      }
   }

   const handleGuestSignIn = async () => {
      setIsLoading(true)
      try {
         await authClient.signIn.email({
            email: "Guest@gmail.com",
            password: "Guest@gmail.com",
         }, {
            onRequest: () => {
               toast("Signing in as guest...")
            },
            onSuccess: async () => {
               toast.success("Successfully signed in as guest!")
               
               console.log('Guest sign-in successful in dialog, refreshing user state...');
               
               // Refresh user context first
               if (refreshUser) {
                  await refreshUser();
               }
               
               // Process pending data after successful guest sign-in
               const redirectUrl = await processPendingData();
               console.log('Redirect URL:', redirectUrl);
               if (redirectUrl) {
                  router.push(redirectUrl);
               } else {
                  router.refresh();
               }
            },
            onError: (ctx) => {
               toast.error(ctx.error.message)
            },
         })
      } catch {
         toast.error("Failed to sign in as guest")
      } finally {
         setIsLoading(false)
      }
   }

   if (!isOpen) return null

   return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
         <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
               <CardTitle className="text-2xl">Welcome back</CardTitle>
               <CardDescription>
                  Enter your credentials to sign in to your account
               </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                     <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                     />
                  </svg>
                  Login with Google
               </Button>
               <Button variant="secondary" className="w-full" onClick={handleGuestSignIn} disabled={isLoading}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Continue as Guest
               </Button>
               <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">
                     Or continue with
                  </span>
               </div>
               <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                     <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                 <Input placeholder="m@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                 <Input type="password" placeholder="********" {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign In"}
                     </Button>
                  </form>
               </Form>
            </CardContent>
            <CardFooter className="mx-auto">
               <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <a href="/sign-up" className="underline underline-offset-4">
                     Sign up
                  </a>
               </div>
            </CardFooter>
         </Card>
      </div>
   )
}