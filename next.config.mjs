// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  basePath: "/dashboard",
  env: {},
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
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
