import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rsg5uys7zq.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io"
      }
    ],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
