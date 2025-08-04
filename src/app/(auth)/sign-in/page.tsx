import Logo from "@/components/logo"
import SignInForm from "@/components/sign-in-form"

export default function SignIn() {
   return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
         <div className="flex w-full max-w-sm flex-col gap-6">
            <Logo />
            <SignInForm />
         </div>
      </div>
   )
}
