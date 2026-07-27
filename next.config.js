/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.mediadelivery.net" }],
  },
};

module.exports = nextConfig;
