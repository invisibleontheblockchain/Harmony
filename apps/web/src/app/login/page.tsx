'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
      <div className="card w-full max-w-[400px]">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome back</h1>
        <SignIn
          afterSignInUrl="/onboarding"
          appearance={{ elements: { formButtonPrimary: 'btn-primary', card: 'bg-transparent border-none shadow-none' } }}
        />
        <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
          New to Harmony? <Link href="/signup" className="text-[var(--accent-purple)] hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
