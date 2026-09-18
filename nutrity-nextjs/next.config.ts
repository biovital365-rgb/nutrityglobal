import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript is checked explicitly by the build script before Next starts.
  // This avoids a second Windows worker that is unstable in constrained CI hosts.
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
