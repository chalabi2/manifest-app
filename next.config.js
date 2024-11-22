/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'imgur.com',
      'i.imgur.com',
      'cloudfront.net',
      'cdn.jsdelivr.net',
      'raw.githubusercontent.com',
      's3.amazonaws.com',
      'storage.googleapis.com',
      'res.cloudinary.com',
      'images.unsplash.com',
      'media.giphy.com',
      'media.istockphoto.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.imgix.net',
      },
      {
        protocol: 'https',
        hostname: '*.staticflickr.com',
      },
      {
        protocol: 'https',
        hostname: '*.twimg.com',
      },
      {
        protocol: 'https',
        hostname: '*.pinimg.com',
      },
      {
        protocol: 'https',
        hostname: '*.giphy.com',
      },
      {
        protocol: 'https',
        hostname: '*.dropboxusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.istockphoto.com',
      },
    ],
  },
};

module.exports = nextConfig;
