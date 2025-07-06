import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Footer from '@/components/Footer'
import MainHeader from '@/components/MainHeader'
import { UserProvider } from '@/context/UserContext'
import { CartProvider } from '@/context/CartContext' // ✅ Thêm

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Trang Bán Hàng Công Nghệ',
  description: 'Mua sắm nông sản và công nghệ chính hãng',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${inter.className} text-gray-800 bg-light min-h-screen`}>

        <UserProvider>
          <CartProvider> {/* ✅ Bọc toàn app với CartProvider */}
            <MainHeader />
            <main className="w-full max-w-screen-xl mx-auto px-4 py-6 min-h-[80vh]">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </UserProvider>
        
      </body>
    </html>
  )
}
