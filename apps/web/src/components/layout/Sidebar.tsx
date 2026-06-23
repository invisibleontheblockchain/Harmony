'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home, Search, Library, Music2, Users, Store, Vote,
  Settings, Wallet, Upload, DollarSign, BarChart3, MessageSquare,
  ChevronRight, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navSections = [
  {
    label: 'DISCOVER',
    items: [
      { href: '/home', icon: Home, label: 'Home' },
      { href: '/search', icon: Search, label: 'Search' },
      { href: '/genre/electronic', icon: Sparkles, label: 'Browse' },
    ],
  },
  {
    label: 'LIBRARY',
    items: [
      { href: '/library', icon: Library, label: 'Library' },
      { href: '/library/liked', icon: Music2, label: 'Liked Tracks' },
      { href: '/library/history', icon: BarChart3, label: 'History' },
    ],
  },
  {
    label: 'STUDIO',
    items: [
      { href: '/studio', icon: Upload, label: 'Dashboard' },
      { href: '/studio/upload', icon: Upload, label: 'Upload Track' },
      { href: '/studio/catalog', icon: Music2, label: 'Catalog' },
      { href: '/studio/earnings', icon: DollarSign, label: 'Earnings' },
      { href: '/studio/analytics', icon: BarChart3, label: 'Analytics' },
      { href: '/studio/nfts', icon: Store, label: 'NFTs' },
      { href: '/studio/dao/create', icon: Vote, label: 'Create Proposal' },
      { href: '/studio/fans', icon: Users, label: 'Subscriptions' },
    ],
  },
  {
    label: 'COMMUNITY',
    items: [
      { href: '/marketplace', icon: Store, label: 'Marketplace' },
      { href: '/collectibles', icon: Store, label: 'Collectibles' },
      { href: '/dao', icon: Vote, label: 'DAO' },
      { href: '/messages', icon: MessageSquare, label: 'Messages' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-screen bg-[var(--bg-primary)] border-r border-[var(--border-subtle)] flex flex-col">
      <div className="p-4">
        <Link href="/home" className="flex items-center gap-2 text-[var(--accent-purple)]">
          <Music2 size={24} />
          <span className="text-lg font-bold tracking-tight">Harmony</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-semibold text-[var(--text-tertiary)] tracking-wider mb-2 px-2">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-sm transition',
                        isActive
                          ? 'bg-[var(--accent-purple)]/10 text-[var(--accent-purple)] border-l-[3px] border-[var(--accent-purple)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                      )}
                    >
                      <item.icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-[var(--border-subtle)]">
        <Link
          href="/account"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-sm transition w-full',
            pathname.startsWith('/account')
              ? 'bg-[var(--accent-purple)]/10 text-[var(--accent-purple)]'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
          )}
        >
          <Settings size={18} />
          <span className="font-medium">Account</span>
          <ChevronRight size={14} className="ml-auto" />
        </Link>
        <Link
          href="/account/wallet"
          className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition mt-1"
        >
          <Wallet size={18} />
          <span className="font-medium">Wallet</span>
        </Link>
      </div>
    </aside>
  );
}
