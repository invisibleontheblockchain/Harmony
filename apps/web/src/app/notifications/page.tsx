'use client';
import { useQuery } from '@tanstack/react-query';
import EmptyState from '@/components/ui/EmptyState';
import SectionHeader from '@/components/ui/SectionHeader';

export default function NotificationsPage() {
  const { data: notifications } = useQuery({
    queryKey: ['/api/notifications'],
    queryFn: () => fetch('/api/notifications').then(r => r.json()),
  });

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {['All', 'Follows', 'Streams', 'NFTs', 'Payouts', 'DAO'].map((tab) => (
            <button key={tab} className="px-3 py-1.5 rounded-full text-sm bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition">{tab}</button>
          ))}
        </div>
        <button className="text-sm text-[var(--accent-purple)]">Mark all read</button>
      </div>
      <div className="space-y-2">
        {notifications?.length ? notifications.map((n: any) => (
          <div key={n.id} className={`card py-3 ${!n.is_read ? 'border-l-[3px] border-l-[var(--accent-purple)]' : ''}`}>
            <p className="font-medium">{n.title}</p>
            <p className="text-sm text-[var(--text-secondary)]">{n.body}</p>
            <span className="text-xs text-[var(--text-tertiary)] mt-1 block">{new Date(n.created_at).toLocaleString()}</span>
          </div>
        )) : <EmptyState title="No notifications" description="You're all caught up." />}
      </div>
    </div>
  );
}
