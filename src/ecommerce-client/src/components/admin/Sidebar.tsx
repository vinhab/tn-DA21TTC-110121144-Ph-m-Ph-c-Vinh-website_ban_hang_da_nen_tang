'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  FaHome,
  FaShoppingCart,
  FaUsers,
  FaListAlt,
  FaBoxOpen,
  FaSignOutAlt,
} from 'react-icons/fa';
import { FiCpu } from 'react-icons/fi';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    console.log('Logging out...');
    router.push('/login');
  };

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: <FaHome /> },
    { href: '/admin/products', label: 'Products', icon: <FaShoppingCart /> },
    { href: '/admin/categories', label: 'Categories', icon: <FaListAlt /> },
    { href: '/admin/users', label: 'Users', icon: <FaUsers /> },
    { href: '/admin/orders', label: 'Orders', icon: <FaBoxOpen /> },
  ];

  return (
    <aside className="bg-white h-screen w-64 p-6 border-r shadow-sm flex flex-col justify-between">
      {/* TOP: Logo + Menu */}
      <div className="flex flex-col space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <Link href="/" className="flex items-center">
            <div className="p-3 bg-white rounded-lg shadow">
              <FiCpu className="text-[#0a3d62] text-3xl" />
            </div>
            <span className="text-2xl font-bold tracking-wide ml-3">
              <span className="text-[#00d8e0]">Tech</span>
              <span>Shop</span>
            </span>
          </Link>
        </div>

        {/* Menu */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-4 px-2">ALL PAGES</h2>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-base font-medium
                  ${isActive
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'}
                `}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* BOTTOM: Logout */}
      <button
        onClick={handleLogout}
        className="mt-6 w-full flex items-center gap-3 px-3 py-2.5 rounded hover:bg-red-50 text-red-600 text-base font-medium"
      >
        <FaSignOutAlt /> Logout
      </button>
    </aside>
  );
}
