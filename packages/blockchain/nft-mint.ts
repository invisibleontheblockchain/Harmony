import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { generateSigner, publicKey } from '@metaplex-foundation/umi';
import { createV1 } from '@metaplex-foundation/mpl-core';

const HARMONY_TREASURY = publicKey(
  process.env.HARMONY_TREASURY_WALLET || 'YOUR_HARMONY_TREASURY_WALLET_ADDRESS'
);

const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export async function mintHarmonyTrackNFT(
  wallet: any,
  trackName: string,
  metadataUri: string,
  artistWallet: string
): Promise<string> {
  const umi = createUmi(SOLANA_RPC).use(walletAdapterIdentity(wallet));

  const asset = generateSigner(umi);
  const tx = await createV1(umi, {
    asset,
    name: trackName,
    uri: metadataUri,
    plugins: [
      {
        plugin: {
          __kind: 'Royalties',
          fields: [
            {
              basisPoints: 1000, // 10% on-chain royalty
              creators: [
                {
                  address: publicKey(artistWallet),
                  percentage: 75,
                },
                {
                  address: HARMONY_TREASURY,
                  percentage: 25,
                },
              ],
              ruleSet: { __kind: 'None' },
            },
          ],
        },
        authority: null,
      },
    ],
  }).sendAndConfirm(umi);

  return asset.publicKey.toString();
}