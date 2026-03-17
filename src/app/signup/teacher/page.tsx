
"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'

import { SignUpForm } from '@/components/auth/signup-form'
import { Logo } from '@/components/logo'
import Link from 'next/link'
import { useTranslation } from '@/hooks/use-translation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { db, auth } from '@/lib/firebase'

export default function TeacherSignupPage() {
  const { t } = useTranslation()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isCheckingRole, setIsCheckingRole] = useState(true)

  useEffect(() => {
    // Only run this check ONCE on initial mount when auth is resolved
    if (authLoading) {
      return
    }

    const checkUserAndRedirect = async () => {
      if (user) {
        // User is logged in, check their role in Firestore
        if (!db || !auth) {
          setIsCheckingRole(false);
          return;
        }

        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userRole = userDocSnap.data()?.role;
          if (userRole === 'teacher' || userRole === 'student') {
            router.push(`/dashboard/${userRole}`);
            return; // Exit after redirect
          }
        }
      }
      
      // If we get here, either no user or user needs to complete signup
      setIsCheckingRole(false);
    };
    
    checkUserAndRedirect();

  }, [authLoading]); // Remove 'user' and 'router' from dependencies to only run on mount after auth is ready


  if (authLoading || isCheckingRole) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="mb-4" aria-label="Back to home">
            <Logo className="h-14 w-14 text-primary" />
          </Link>
          <h1 className="text-3xl font-bold font-headline text-foreground">{t("Teacher Sign Up")}</h1>
          <p className="text-muted-foreground">{t("Create a teacher account to get started.")}</p>
        </div>
        <SignUpForm role="teacher" />
         <div className="text-center text-sm">
            <Button variant="link" asChild>
                <Link href="/signup">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("Back")}
                </Link>
            </Button>
        </div>
      </div>
    </div>
  )
}
