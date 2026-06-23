import React, { useMemo } from 'react';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { useSolanaWallet } from '../hooks/useSolanaWallet';

export const HarmonyWalletProvider = ({ children }: { children: React.ReactNode }) => {
  const { connect } = useSolanaWallet();
  const endpoint = useMemo(() => process.env.EXPO_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com', []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      {children}
    </ConnectionProvider>
  );
};
