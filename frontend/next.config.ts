import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  // Use relative paths for Cloud Storage static hosting
  trailingSlash: true,
};

export default nextConfig;
