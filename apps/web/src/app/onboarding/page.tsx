'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type OnboardingStep = 1 | 2 | 3 | 4 | 5;

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>(1);
  const [intent, setIntent] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-6">
      <div className="card w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Setup your Harmony account</h1>
          <span className="text-xs text-[var(--text-tertiary)]">{step}/5</span>
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">What brings you to Harmony?</h2>
            <div className="space-y-3">
              {['Listen to music', 'Create and share my music', 'Both'].map((option) => (
                <button
                  key={option}
                  onClick={() => { setIntent(option); setStep(2); }}
                  className={`w-full text-left px-4 py-3 rounded-[var(--radius-md)] border transition ${intent === option ? 'border-[var(--accent-purple)] bg-[var(--accent-purple)]/10' : 'border-[var(--border-default)] hover:border-[var(--border-accent)]'}`}
                >
                  <span className="font-medium">{option}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Pick your favorite genres <span className="text-[var(--error)]">*</span></h2>
            <div className="flex flex-wrap gap-2">
              {['Electronic', 'Hip-Hop', 'Rock', 'Jazz', 'Classical', 'Pop', 'Ambient', 'Techno', 'R&B', 'Lo-Fi'].map((g) => (
                <span key={g} className="px-3 py-1.5 rounded-full border border-[var(--border-default)] text-sm cursor-pointer hover:border-[var(--accent-purple)] transition">{g}</span>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setStep(3)}>Continue <ChevronRight size={16} /></Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Follow some artists to get started</h2>
            <div className="grid grid-cols-3 gap-3">
              {['Aurora Veil', 'Solar Flare', 'Rhythm Theory', 'Deep Resonance', 'Nova Echo', 'Crystal Mind'].map((a) => (
                <div key={a} className="card text-center py-4 cursor-pointer hover:border-[var(--border-accent)] transition">
                  <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] mx-auto mb-2" />
                  <span className="text-sm font-medium">{a}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setStep(4)}>Continue <ChevronRight size={16} /></Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Set up your artist profile</h2>
            <div className="space-y-4">
              <input className="input" placeholder="Display name" />
              <textarea className="input h-24 resize-none" placeholder="Short bio..." />
              <input className="input" placeholder="Website (optional)" />
            </div>
            <div className="mt-6 flex justify-between">
              <button className="btn-secondary" onClick={() => setStep(3)}>Back</button>
              <Button onClick={() => setStep(5)}>Continue <ChevronRight size={16} /></Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Connect Stripe to receive payouts</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Artists must connect a Stripe account to receive royalty payouts. Listeners can skip this step.</p>
            <div className="card bg-[var(--bg-tertiary)]">
              <p className="text-sm text-[var(--text-secondary)]">Stripe Connect Express — secure OAuth</p>
            </div>
            <div className="mt-6 flex justify-between">
              <button className="btn-secondary" onClick={() => setStep(4)}>Back</button>
              <Button onClick={() => router.push('/home')}>Finish</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
