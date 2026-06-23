import { processNatively } from '@solana-mobile/mobile-wallet-adapter-protocol';
import { useCallback } from 'react';

export function useSolanaWallet() {
  const connect = useCallback(async () => {
    try {
      const result = await processNatively({
        identity: { name: 'Harmony' },
        authorizationScope: 'read-write',
      });
      return result;
    } catch (e) {
      console.warn('Mobile Wallet Adapter not available, falling back to deeplink', e);
      const scheme = 'solana-wallet://';
      return null;
    }
  }, []);

  return { connect };
}
