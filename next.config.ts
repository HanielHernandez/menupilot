import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/auth/login",
        destination: "/auth/signin",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
