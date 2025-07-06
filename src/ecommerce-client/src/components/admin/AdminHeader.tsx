'use client';
import { useEffect, useState } from 'react';
import { FiMenu, FiBell, FiMessageCircle } from 'react-icons/fi';
import Image from 'next/image';
import { fetchMe } from '@/lib/api'; // Đảm bảo đã có hàm này

type User = {
  name: string;
  role: string;
  avatar: string;
};

export default function AdminHeader({ toggleSidebar }: { toggleSidebar: () => void }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchMe()
      .then(data => setUser(data))
      .catch(() => setUser(null));
  }, []);

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="lg:hidden text-gray-600">
          <FiMenu size={24} />
        </button>
        <span className="text-xl font-bold text-blue-600 hidden sm:block">Admin Site</span>
      </div>
      <div className="flex items-center gap-4">
        
        <FiBell className="text-xl text-gray-600" />
        <FiMessageCircle className="text-xl text-gray-600" />
        <div className="flex items-center gap-2">
          <Image
            src={user?.avatar || 'https://i.pravatar.cc/40?img=3'}
            alt="Avatar"
            width={36}
            height={36}
            className="rounded-full"
          />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold">{user?.name || '...'}</p>
            <p className="text-xs text-gray-400">{user?.role || ''}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
