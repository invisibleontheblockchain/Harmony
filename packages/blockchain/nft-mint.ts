import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { generateSigner, publicKey } from '@metaplex-foundation/umi';
import { createV1 } from '@metaplex-foundation/mpl-core';

const HARMONY_TREASURY = publicKey('YOUR_HARMONY_TREASURY_WALLET_ADDRESS');

const umi = createUmi('https://api.mainnet-beta.solana.com')
  .use(walletAdapterIdentity(wallet));

export async function mintHarmonyTrackNFT(metadataUri: string, artistWallet: string) {
  const asset = generateSigner(umi);
  const tx = await createV1(umi, {
    asset,
    name: 'Track Title',
    uri: metadataUri,
    plugins: [{
      type: 'Royalties',
      basisPoints: 1000,
      creators: [{ 
        address: publicKey(artistWallet), 
        percentage: 75 
      },{ 
        address: HARMONY_TREASURY, 
        percentage: 25 
      }],
      ruleSet: 'Enforced'
    }]
  }).sendAndConfirm(umi);
  
  return asset.publicKey.toString();
}