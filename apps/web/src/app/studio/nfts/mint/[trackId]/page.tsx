'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function MintNFTPage({ params }: { params: { trackId: string } }) {
  const [step, setStep] = useState(1);
  const [editionType, setEditionType] = useState<'1/1' | 'limited'>('1/1');
  const [editionCount, setEditionCount] = useState(10);
  const [price, setPrice] = useState('0.5');
  const [royaltyPct, setRoyaltyPct] = useState(10);
  const [benefits, setBenefits] = useState<string[]>(['Early access']);

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mint NFT</h1>
      <div className="flex items-center gap-2 mb-8">
        {['Edition', 'Pricing', 'Publish'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step > i + 1 || step === i + 1 ? 'bg-[var(--accent-purple)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-tertiary)]'}`}>
              {i + 1}
            </div>
            <span className="text-sm font-medium">{label}</span>
            {i < 2 && <div className="w-12 h-px bg-[var(--border-default)] mx-2" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Edition Type</label>
            <div className="flex gap-3 mt-2">
              {(['1/1', 'limited'] as const).map((type) => (
                <button key={type} onClick={() => setEditionType(type)} className={`flex-1 py-3 rounded-[var(--radius-md)] border transition ${editionType === type ? 'border-[var(--accent-purple)] bg-[var(--accent-purple)]/10' : 'border-[var(--border-default)]'}`}>
                  {type === '1/1' ? 'One of One' : 'Limited Edition'}
                </button>
              ))}
            </div>
          </div>
          {editionType === 'limited' && (
            <div>
              <label className="text-sm font-medium">Edition Count</label>
              <input className="input mt-1" type="number" value={editionCount} onChange={(e) => setEditionCount(Number(e.target.value))} />
            </div>
          )}
          <div className="flex justify-end"><button className="btn-primary" onClick={() => setStep(2)}>Next</button></div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Price (ETH)</label>
            <input className="input mt-1" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Royalty %</label>
            <input className="input mt-1" type="range" min="0" max="50" value={royaltyPct} onChange={(e) => setRoyaltyPct(Number(e.target.value))} />
            <span className="text-sm text-[var(--text-secondary)]">{royaltyPct}%</span>
          </div>
          <div>
            <label className="text-sm font-medium">Collector Benefits</label>
            {benefits.map((b, i) => (
              <div key={i} className="flex gap-2 mt-2">
                <input className="input flex-1" value={b} onChange={(e) => { const next = [...benefits]; next[i] = e.target.value; setBenefits(next); }} />
                <button onClick={() => setBenefits(benefits.filter((_, idx) => idx !== i))} className="text-[var(--error)]">Remove</button>
              </div>
            ))}
            <button className="btn-secondary mt-2" onClick={() => setBenefits([...benefits, ''])}>Add Benefit</button>
          </div>
          <div className="flex justify-between">
            <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
            <button className="btn-primary" onClick={() => setStep(3)}>Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="card bg-[var(--bg-tertiary)]">
            <p className="font-medium">Edition: {editionType === '1/1' ? '1 of 1' : `${editionCount} editions`}</p>
            <p className="text-sm text-[var(--text-secondary)]">Price: {price} ETH</p>
            <p className="text-sm text-[var(--text-secondary)]">Royalty: {royaltyPct}%</p>
          </div>
          <div className="flex justify-between">
            <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
            <button className="btn-primary" onClick={() => alert('Minting...')}>Mint NFT</button>
          </div>
        </div>
      )}
    </div>
  );
}
