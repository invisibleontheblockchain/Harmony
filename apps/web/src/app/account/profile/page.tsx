'use client';
import { useState } from 'react';

export default function AccountProfilePage() {
  return (
    <div className="px-6 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
      <div className="card space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-[var(--bg-tertiary)]" />
          <button className="btn-secondary">Change Avatar</button>
        </div>
        <div>
          <label className="text-sm font-medium">Display Name</label>
          <input className="input mt-1" defaultValue="Aurora Veil" />
        </div>
        <div>
          <label className="text-sm font-medium">Bio</label>
          <textarea className="input h-24 resize-none mt-1" placeholder="Tell fans about yourself..." />
        </div>
        <div>
          <label className="text-sm font-medium">Social Links</label>
          <div className="space-y-2 mt-1">
            <input className="input" placeholder="Instagram URL" />
            <input className="input" placeholder="Twitter/X URL" />
            <input className="input" placeholder="Website URL" />
          </div>
        </div>
        <div className="flex justify-end"><button className="btn-primary">Save Changes</button></div>
      </div>
    </div>
  );
}
