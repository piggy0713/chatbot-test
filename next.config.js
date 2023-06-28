/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    apiUrl: process.env.API_URL,
  },
};

module.exports = nextConfig;
