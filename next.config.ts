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
      // Accounts and subscriptions were removed in the September 2026 revamp.
      { source: "/login", destination: "/", permanent: true },
      { source: "/signup", destination: "/", permanent: true },
      { source: "/dashboard", destination: "/", permanent: true },
      { source: "/career-gps", destination: "/discover", permanent: true },
      // Featured job pages were removed; any old link lands on the job search.
      { source: "/jobs/:id", destination: "/jobs", permanent: true },
    ];
  },
};

export default nextConfig;
