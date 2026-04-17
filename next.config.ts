import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Supabase Storage — produtos e avatares
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Google — fotos de perfil OAuth
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        // Facebook — fotos de perfil OAuth
        protocol: "https",
        hostname: "*.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "graph.facebook.com",
      },
    ],
  },
};

export default nextConfig;
