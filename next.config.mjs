/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Chấp nhận tất cả hostname
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  eslint: {
    // Cho phép production build thành công ngay cả khi có ESLint warnings
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
