import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

export default function SignOutForm(
   { children }: React.PropsWithChildren<unknown>
) {
   return (
      <form action={async () => {
         'use server'
         await auth.api.signOut({
            headers: await headers()
         })
         redirect("/")
      }}>
         {children}
      </form>
   )
}
