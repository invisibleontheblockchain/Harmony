'use client';
import { useState } from 'react';
import { RichTextEditor } from '@/components/forms/RichTextEditor';

export default function CreateProposalPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [votingPeriod, setVotingPeriod] = useState('7');

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create DAO Proposal</h1>
      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Proposal title" />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <select className="input mt-1" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select category...</option>
              <option value="treasury">Treasury</option>
              <option value="platform">Platform</option>
              <option value="governance">Governance</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Voting Duration (days)</label>
            <input className="input mt-1" type="number" value={votingPeriod} onChange={(e) => setVotingPeriod(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <RichTextEditor value={description} onChange={setDescription} />
          </div>
          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => window.history.back()}>Cancel</button>
            <button className="btn-primary" onClick={() => alert('Proposal created!')}>Publish Proposal</button>
          </div>
        </div>
        <div className="w-80 card hidden xl:block">
          <h3 className="font-semibold mb-2">Preview</h3>
          <div className="bg-[var(--bg-tertiary)] rounded-[var(--radius-md)] p-4 min-h-[200px]">
            {description ? <p className="text-sm text-[var(--text-secondary)]">{description}</p> : <p className="text-sm text-[var(--text-tertiary)]">Preview will appear here...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
