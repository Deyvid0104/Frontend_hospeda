/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  // Configuración para optimizar imágenes
  images: {
    domains: ['5.189.171.241'],
    unoptimized: true
  },
  // Configuración para variables de entorno públicas
  env: {
    NEXT_PUBLIC_API_URL: 'http://5.189.171.241:30400'
  }
};

export default nextConfig;
