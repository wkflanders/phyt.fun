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
        hostname: "d1za1h12no9co6.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "d9dbhfllhp347.cloudfront.net",
        pathname: "/prod/avatars/**",
      },
      {
        protocol: "https",
        hostname: "d1o7ihod05ar3g.cloudfront.net"
      },
      {
        protocol: "https",
        hostname: "d5mhfgomyfg7p.cloudfront.net"
      },
      {
        protocol: "https",
        hostname: "https://dc1foe9a4vvf0.cloudfront.net"
      },
    ],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
