/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pictures-kenya.jijistatic.com',
      },
    ],
  },
};

export default nextConfig;
