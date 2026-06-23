'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CatalogEditPage({ params }: { params: { trackId: string } }) {
  const router = useRouter();
  const [title, setTitle] = useState('Midnight Echoes');
  const [status, setStatus] = useState('active');

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Track</h1>
      <div className="card space-y-4">
        <div>
          <label className="text-sm font-medium">Title</label>
          <input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <select className="input mt-1" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="deleted">Take Down</option>
          </select>
        </div>
        <div className="pt-4 border-t border-[var(--border-subtle)]">
          <h3 className="font-semibold text-[var(--error)] mb-2">Danger Zone</h3>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-[var(--radius-md)] border border-[var(--error)] text-[var(--error)] hover:bg-[var(--error)]/10 transition">Take Down</button>
            <button className="px-4 py-2 rounded-[var(--radius-md)] border border-[var(--error)] text-[var(--error)] hover:bg-[var(--error)]/10 transition">Delete</button>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button className="btn-secondary" onClick={() => router.back()}>Cancel</button>
          <button className="btn-primary" onClick={() => router.push('/studio/catalog')}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
