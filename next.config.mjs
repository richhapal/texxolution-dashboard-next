// @ts-check
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  basePath: "/dashboard",
  env: {},

  // Performance optimizations
  swcMinify: true,
  compress: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.freejobsalert.info",
      },
      {
        protocol: "http",
        hostname: "www.freejobsalert.info",
      },
      {
        protocol: "https",
        hostname: "freejobsalert.info",
      },
      {
        protocol: "http",
        hostname: "freejobsalert.info",
      },
      {
        protocol: "https",
        hostname: "www.ikea.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Bundle analysis and optimization configuration
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Optimize chunk splitting
    config.optimization.splitChunks = {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
          priority: 10,
        },
        heroui: {
          test: /[\\/]node_modules[\\/]@heroui[\\/]/,
          name: "heroui",
          chunks: "all",
          priority: 20,
        },
        common: {
          name: "common",
          minChunks: 2,
          chunks: "all",
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    };

    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
