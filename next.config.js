/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['your-linode-bucket-name.your-region.linodeobjects.com'],
    },
    ...(process.env.MOBILE_BUILD === 'true' ? {
        output: 'export',
        pageExtensions: ['mobile.tsx', 'mobile.ts', 'mobile.jsx', 'mobile.js'],
    } : {}),
}

module.exports = nextConfig; 