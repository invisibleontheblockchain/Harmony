# Harmony - Music Streaming + NFT Platform

Engineering blueprint implementation for a music streaming platform with blockchain-based artist royalties.

## Architecture Layers

1. **Streaming Infrastructure** - R2 storage, HLS transcoding, presigned uploads
2. **Royalty Engine** - PostgreSQL with enforced 100% split constraint
3. **Discovery Algorithm** - ALS collaborative filtering + Essentia audio features
4. **Blockchain Layer** - Solana + Metaplex Core pNFT + Irys/Arweave metadata
5. **Payment Rails** - Stripe Connect for artist payouts
6. **Mobile Apps** - React Native + Expo with background audio

## Database Schema

See `packages/db-schema/schema.sql`