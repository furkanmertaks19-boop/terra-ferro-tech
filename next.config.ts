import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "media-src 'self' blob: https://res.cloudinary.com",
  "font-src 'self' data:",
  "connect-src 'self' https://res.cloudinary.com https://api.cloudinary.com",
  "frame-src https://www.google.com https://maps.google.com",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  ...(isDev
    ? []
    : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "@prisma/adapter-pg",
    "pg",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react", "motion"],
    serverActions: {
      bodySizeLimit: "21mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/traktorler", destination: "/traktoret", permanent: true },
      { source: "/tarim-makineleri", destination: "/makineri-bujqesore", permanent: true },
      { source: "/about", destination: "/rreth-nesh", permanent: true },
      { source: "/contact", destination: "/kontakt", permanent: true },
      { source: "/gallery", destination: "/galeri", permanent: true },
      { source: "/services", destination: "/sherbimet", permanent: true },
      { source: "/hakkimizda", destination: "/rreth-nesh", permanent: true },
      { source: "/iletisim", destination: "/kontakt", permanent: true },
      { source: "/galeriya", destination: "/galeri", permanent: true },
      { source: "/login", destination: "/admin/login", permanent: false },
      { source: "/urunler/:slug", destination: "/produkte/:slug", permanent: true },
      { source: "/admin/quotes", destination: "/admin/leads", permanent: false },
    ];
  },
};

export default nextConfig;
