let path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { buildId, dev }) => {
    config.resolve.alias.react = path.join(__dirname, 'node_modules', 'react');
    return config;
  },
};

module.exports = nextConfig;
