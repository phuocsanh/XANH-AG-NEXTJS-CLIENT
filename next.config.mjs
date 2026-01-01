/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Chấp nhận tất cả hostname
      },
    ],
  },
  eslint: {
    // Cho phép production build thành công ngay cả khi có ESLint warnings
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
