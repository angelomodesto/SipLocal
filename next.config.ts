import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3-media*.fl.yelpcdn.com",
      },
      {
        protocol: "https",
        hostname: "yelpcdn.com",
      },
      {
        protocol: "https",
        hostname: "*.yelpcdn.com",
      },
    ],
  },
};

export default nextConfig;
