/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['your-linode-bucket-name.your-region.linodeobjects.com'],
    },
}

module.exports = nextConfig; 