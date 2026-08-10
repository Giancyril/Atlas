import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow server-side imports for pg (Postgres driver)
  serverExternalPackages: ["pg"],
};

export default nextConfig;
