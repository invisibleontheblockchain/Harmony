'use client';
import TrackCard from '@/components/cards/TrackCard';
import EmptyState from '@/components/ui/EmptyState';

export default function PlaylistNewPage() {
  return (
    <div className="px-6 py-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Playlist</h1>
      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input className="input" placeholder="My awesome playlist" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea className="input h-24 resize-none" placeholder="Describe this playlist..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cover Art</label>
          <div className="h-32 rounded-[var(--radius-md)] border-2 border-dashed border-[var(--border-default)] flex items-center justify-center text-[var(--text-tertiary)]">
            Drop image or click to upload
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="public" className="accent-[var(--accent-purple)]" defaultChecked />
          <label htmlFor="public" className="text-sm">Public playlist</label>
        </div>
        <button className="btn-primary w-full">Create Playlist</button>
      </div>
    </div>
  );
}
