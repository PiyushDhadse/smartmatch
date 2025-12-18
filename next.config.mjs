/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Turbopack for stable build
  experimental: {
    turbo: false,
  },
  // Keep reactCompiler if you need it, but it might cause issues
  reactCompiler: false,
};

module.exports = nextConfig;
