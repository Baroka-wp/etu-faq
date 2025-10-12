import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@prisma/client'],
  // Configuration pour Vercel
  output: 'standalone',
  // Optimisations pour la production
  compress: true,
  poweredByHeader: false,
  // Configuration des images
  images: {
    domains: ['z-cdn-media.chatglm.cn'],
    formats: ['image/webp', 'image/avif'],
  },
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;