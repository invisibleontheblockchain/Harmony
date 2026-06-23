'use client';
import React from 'react';

/**
 * Conditionally wraps children in ClerkProvider only when a valid
 * NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set. This lets the app boot
 * in dev without real Clerk credentials.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isValidKey = key && key.startsWith('pk_') && !key.includes('xxxx');

  if (isValidKey) {
    // Dynamic import keeps Clerk out of the bundle when not needed
    const { ClerkProvider } = require('@clerk/nextjs');
    return <ClerkProvider publishableKey={key}>{children}</ClerkProvider>;
  }

  return <>{children}</>;
}
