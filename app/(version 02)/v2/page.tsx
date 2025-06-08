'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function V2Redirect() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      router.replace('/v2/dashboard');
    } else {
      router.replace('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  return null;
} 