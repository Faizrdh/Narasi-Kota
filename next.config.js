// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {

   experimental: {
    instrumentationHook: true, // ← tambahkan ini
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.instagram.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
       // ✅ Tambahan — izinkan semua domain berita umum
      { protocol: "https", hostname: "www.antaranews.com" },
      { protocol: "https", hostname: "antaranews.com" },
      { protocol: "https", hostname: "**.antaranews.com" },
      { protocol: "https", hostname: "www.katadata.co.id" },
      { protocol: "https", hostname: "katadata.co.id" },
      { protocol: "https", hostname: "**.katadata.co.id" },
      
       { protocol: "https", hostname: "www.detik.com" },
      { protocol: "https", hostname: "detik.com" },
      { protocol: "https", hostname: "**.detik.com" },
    ],
  },
}

module.exports = nextConfig