import { Inter } from 'next/font/google';
import SidebarWrapper from '@/components/admin/SidebarWrapper';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Admin Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.className} text-gray-800 bg-gray-100`}>
      <SidebarWrapper>{children}</SidebarWrapper>
    </div>
  );
}
