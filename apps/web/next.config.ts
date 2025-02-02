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
        hostname: "d9dbhfllhp347.cloudfront.net",
        pathname: "/dev/avatars/**",
      },
      {
        protocol: "https",
        hostname: "d9dbhfllhp347.cloudfront.net",
        pathname: "/prod/avatars/**",
      },
    ],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
