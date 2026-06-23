'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignUp } from '@clerk/nextjs';

export default function SignupPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
      <div className="card w-full max-w-[400px]">
        <h1 className="text-2xl font-bold text-center mb-6">Create your account</h1>
        <SignUp
          afterSignUpUrl="/onboarding"
          appearance={{ elements: { formButtonPrimary: 'btn-primary', card: 'bg-transparent border-none shadow-none' } }}
        />
        <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
          Already have an account? <Link href="/login" className="text-[var(--accent-purple)] hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
