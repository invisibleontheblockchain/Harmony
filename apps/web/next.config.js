/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.harmony.fm' },
      { protocol: 'https', hostname: 'arweave.net' },
      { protocol: 'https', hostname: 'gateway.irys.xyz' },
    ],
  },
};
module.exports = nextConfig;
