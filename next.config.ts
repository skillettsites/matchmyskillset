import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.matchmyskillset.com" }],
        destination: "https://matchmyskillset.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
