import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 top-0 -left-4" style={{ animation: 'blob 7s infinite' }}></div>
        <div className="absolute w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 top-0 -right-4" style={{ animation: 'blob 7s infinite 2s' }}></div>
        <div className="absolute w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 bottom-0 left-20" style={{ animation: 'blob 7s infinite 4s' }}></div>
      </div>

      <div className="relative z-10 text-center space-y-8 p-6 sm:p-8 max-w-2xl mx-auto">
        {/* Logo Container */}
        <div className="relative w-32 h-32 sm:w-48 sm:h-48 mx-auto">
          <div className="absolute inset-0 bg-white rounded-full shadow-2xl animate-pulse"></div>
          <div className="relative w-full h-full p-4 sm:p-6">
            <Image
              src="/logo.png"
              alt="Logo SD Negeri"
              fill
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
        </div>
        
        {/* Title Section */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg tracking-tight">
            SIP-HP
          </h1>
          <div className="h-1 w-24 bg-white/50 mx-auto rounded-full"></div>
          <p className="text-xl sm:text-2xl text-blue-50 font-medium">
            Sistem Informasi Penghapusan
          </p>
          <p className="text-lg sm:text-xl text-blue-100">
            SD Negeri 2 Tunjungtirto
          </p>
          <p className="text-base sm:text-lg text-blue-200 font-light">
            Kabupaten Malang, Jawa Timur
          </p>
        </div>

        {/* CTA Button */}
        <Link
          href="/login"
          className="inline-flex items-center space-x-2 px-8 sm:px-10 py-4 sm:py-5 bg-white text-blue-700 font-bold text-base sm:text-lg rounded-2xl shadow-2xl hover:shadow-3xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 group"
        >
          <span>Masuk ke Sistem</span>
          <svg 
            className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="text-3xl mb-2">🔒</div>
            <p className="text-white text-sm font-medium">Aman & Terpercaya</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="text-3xl mb-2">⚡</div>
            <p className="text-white text-sm font-medium">Cepat & Efisien</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-white text-sm font-medium">Terintegrasi</p>
          </div>
        </div>
      </div>
    </main>
  )
}