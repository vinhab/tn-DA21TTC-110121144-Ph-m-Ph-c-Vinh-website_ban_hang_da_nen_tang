// app/layout.tsx
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { UserProvider } from '@/context/UserContext'
import { CartProvider } from '@/context/CartContext'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${inter.className} text-gray-800 bg-light min-h-screen`}>
        <UserProvider>
          <CartProvider>
            {children}
            <Toaster position="top-center" reverseOrder={false} />
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  )
}
