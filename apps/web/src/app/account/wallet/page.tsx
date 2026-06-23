'use client';
import { Wallet, Copy, ExternalLink } from 'lucide-react';

export default function WalletPage() {
  return (
    <div className="px-6 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Wallet Connection</h1>

      <div className="card mb-6">
        <h2 className="font-semibold mb-4">Connected Wallet</h2>
        <div className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-[var(--radius-md)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent-purple)]/20 flex items-center justify-center"><Wallet size={20} /></div>
            <div>
              <p className="font-mono text-sm">7xKz...4mNp</p>
              <p className="text-xs text-[var(--text-secondary)]">Solana Mainnet</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary text-xs"><Copy size={14} /> Copy</button>
            <a href="https://solscan.io/account/7xKz...4mNp" target="_blank" rel="noopener" className="btn-secondary text-xs"><ExternalLink size={14} /> View</a>
          </div>
        </div>
      </div>

      <button className="btn-secondary">Connect Additional Wallet</button>
      <p className="text-xs text-[var(--text-tertiary)] mt-2">Supported: MetaMask, WalletConnect, Coinbase Wallet, Phantom</p>
    </div>
  );
}
