'use client';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import { useRouter } from 'next/navigation';
import { fetchMe } from '@/lib/api';

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchMe()
      .then(user => {
        if (user.role === 'admin') {
          setIsAdmin(true);
        } else {
          router.replace('/not-authorized'); // hoặc redirect ra trang chủ, tuỳ bạn
        }
      })
      .catch(() => {
        router.replace('/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return <div className="p-6 text-center">Đang kiểm tra quyền truy cập...</div>;
  }
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute top-0 left-0 w-64 h-full bg-white shadow-lg z-50">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1">
        <AdminHeader toggleSidebar={() => setSidebarOpen(true)} />
        <main className="p-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
