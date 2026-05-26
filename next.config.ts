// next.config.ts
// Next.js configuration.
// External image domains must be whitelisted here for next/image to work.

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // RoboHash — default character avatars
        protocol: "https",
        hostname: "robohash.org",
      },
      {
        // Supabase Storage — uploaded character portraits
        // Replace YOUR_PROJECT_REF with your actual Supabase project ref
        // (the part of your Supabase URL between https:// and .supabase.co)
        // Example: if your URL is https://abcdefgh.supabase.co, use "abcdefgh"
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
