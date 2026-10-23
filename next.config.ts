import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // static export has no image optimizer
  images: { unoptimized: true },
};

export default nextConfig;
