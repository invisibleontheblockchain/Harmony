import Irys from '@irys/sdk';

interface TrackData {
  title: string;
  artist: string;
  genre: string;
  isrc: string;
  coverArtArweaveHash: string;
  audioPreviewHash: string;
}

export async function uploadMetadataToArweave(
  trackData: TrackData,
  wallet: any
): Promise<string> {
  const irys = new Irys({
    url: process.env.IRYS_NODE_URL || 'https://devnet.irys.xyz',
    token: 'solana',
    key: wallet.secretKey,
  });

  const metadata = {
    name: trackData.title,
    description: `Harmony Music NFT: ${trackData.title} by ${trackData.artist}`,
    image: trackData.coverArtArweaveHash,
    animation_url: trackData.audioPreviewHash,
    attributes: [
      { trait_type: 'Artist', value: trackData.artist },
      { trait_type: 'Genre', value: trackData.genre },
      { trait_type: 'ISRC', value: trackData.isrc },
    ],
  };

  const receipt = await irys.upload(JSON.stringify(metadata), {
    tags: [{ name: 'Content-Type', value: 'application/json' }],
  });

  return `https://gateway.irys.xyz/${receipt.id}`;
}