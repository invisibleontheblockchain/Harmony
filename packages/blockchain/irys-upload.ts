import Irys from '@irys/sdk';

async function uploadMetadataToArweave(trackData: any, wallet: any) {
  const irys = new Irys({
    url: 'https://node1.irys.xyz',
    token: 'solana',
    key: wallet.secretKey
  });

  const metadata = {
    name: trackData.title,
    description: `Harmony Music NFT: ${trackData.title} by ${trackData.artist}`,
    image: trackData.coverArtArweaveHash,
    animation_url: trackData.audioPreviewHash,
    attributes: [
      { trait_type: 'Artist', value: trackData.artist },
      { trait_type: 'Genre', value: trackData.genre },
      { trait_type: 'ISRC', value: trackData.isrc }
    ]
  };

  const receipt = await irys.upload(JSON.stringify(metadata), {
    tags: [{ name: 'Content-Type', value: 'application/json' }]
  });
  
  return `https://gateway.irys.xyz/${receipt.id}`;
}