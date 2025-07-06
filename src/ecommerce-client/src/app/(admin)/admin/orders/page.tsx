'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaSearch, FaEllipsisV, FaEye, FaTrash } from 'react-icons/fa';
import {
  fetchAllOrders,
  updateOrderStatus,
  cancelOrder,
  fetchUsers,
} from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Order {
  _id: string;
  userId: string;
  items: any[];
  total: number;
  status: string;
  paymentMethod: string;
  address: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  name: string;
}

function formatStatus(status: string) {
  switch (status) {
    case 'pending': return 'Chờ thanh toán';
    case 'paid': return 'Đã thanh toán';
    case 'shipped': return 'Đang giao';
    case 'delivered': return 'Đã giao';
    case 'cancelled': return 'Đã hủy';
    default: return status;
  }
}

const orderStatusList = [
  { value: 'pending', label: 'Chờ thanh toán' },
  { value: 'paid', label: 'Đã thanh toán' },
  { value: 'shipped', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã hủy' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null); // <-- Menu 3 chấm

  // Tạo map userId -> name cho render nhanh
  const userMap = users.reduce((acc, user) => {
    acc[user._id] = user.name;
    return acc;
  }, {} as Record<string, string>);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      setError('');
      try {
        const [ordersData, usersData] = await Promise.all([
          fetchAllOrders(),
          fetchUsers(),
        ]);
        setOrders(ordersData);
        setUsers(usersData);
      } catch {
        setError('Không lấy được dữ liệu');
        toast.error('Không lấy được dữ liệu');
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  async function handleUpdateStatus(orderId: string, status: string) {
    setLoading(true);
    try {
      await updateOrderStatus(orderId, status);
      const ordersData = await fetchAllOrders();
      setOrders(ordersData);
      toast.success('Cập nhật trạng thái thành công!');
    } catch {
      setError('Không cập nhật được trạng thái');
      toast.error('Không cập nhật được trạng thái');
    } finally {
      setLoading(false);
    }
  }

  function handleCancel(orderId: string) {
    toast((t) => (
      <span>
        <div className="font-medium mb-1">Bạn có chắc muốn hủy đơn hàng này?</div>
        <div className="flex gap-3 justify-end">
          <button
            className="px-3 py-1 rounded text-white bg-red-600 hover:bg-red-700 text-sm"
            onClick={async () => {
              toast.dismiss(t.id);
              setCancellingId(orderId);
              try {
                await cancelOrder(orderId);
                const ordersData = await fetchAllOrders();
                setOrders(ordersData);
                toast.success('Đã huỷ đơn hàng');
              } catch {
                setError('Không huỷ được đơn hàng');
                toast.error('Không huỷ được đơn hàng');
              } finally {
                setCancellingId(null);
              }
            }}
          >
            Xác nhận
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
            onClick={() => toast.dismiss(t.id)}
          >
            Huỷ
          </button>
        </div>
      </span>
    ), { duration: 8000 });
  }

  // Lọc theo tên user, ngày, trạng thái, sđt, địa chỉ
  const filteredOrders = orders.filter(o =>
    (userMap[o.userId]?.toLowerCase().includes(search.toLowerCase()) || o.userId.toLowerCase().includes(search.toLowerCase())) ||
    (o.phone && o.phone.toLowerCase().includes(search.toLowerCase())) ||
    (o.address && o.address.toLowerCase().includes(search.toLowerCase())) ||
    (formatStatus(o.status).toLowerCase().includes(search.toLowerCase()))
  );

  // Đóng menu khi click ngoài
  useEffect(() => {
    function handleClickOutside(e: any) {
      setOpenMenu(null);
    }
    if (openMenu) {
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }
  }, [openMenu]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h1>
      <div className="relative max-w-xs mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <FaSearch />
        </span>
        <input
          type="text"
          placeholder="Tìm tên khách, trạng thái, sđt, địa chỉ..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-[#0a3d62] focus:outline-none shadow-sm"
        />
      </div>
      {error && <div className="text-red-500 font-medium">{error}</div>}
      {loading ? (
        <div className="text-center text-gray-500">Đang tải...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-md">
            <thead>
              <tr className="bg-[#eaf6fb] text-[#0a3d62] text-left text-sm">
                <th className="px-4 py-3">Tên khách</th>
                <th className="px-4 py-3">Ngày đặt</th>
                <th className="px-4 py-3">Tổng tiền</th>
                <th className="px-4 py-3">Số điện thoại</th>
                <th className="px-4 py-3">Địa chỉ</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-400">
                    Không có đơn hàng nào
                  </td>
                </tr>
              )}
              {filteredOrders.map(order => (
                <tr key={order._id} className="border-b last:border-none hover:bg-blue-50 transition">
                  <td className="px-4 py-3 font-medium">{userMap[order.userId] || order.userId}</td>
                  <td className="px-4 py-3">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{order.total?.toLocaleString()}đ</td>
                  <td className="px-4 py-3">{order.phone}</td>
                  <td className="px-4 py-3">{order.address}</td>
                  <td className="px-4 py-3">
                    <select
                      className="border rounded px-2 py-1 text-xs"
                      value={order.status}
                      onChange={e => handleUpdateStatus(order._id, e.target.value)}
                      disabled={order.status === 'cancelled'}
                    >
                      {orderStatusList.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center relative">
                    {/* Nút 3 chấm */}
                    <button
                      className="w-9 h-9 rounded-full hover:bg-gray-200 flex items-center justify-center relative"
                      onClick={e => {
                        e.stopPropagation();
                        setOpenMenu(openMenu === order._id ? null : order._id);
                      }}
                    >
                      <FaEllipsisV />
                    </button>
                    {openMenu === order._id && (
                      <div
                        className="absolute right-0 top-12 bg-white border rounded shadow z-50 min-w-[140px] text-sm py-1"
                        onClick={e => e.stopPropagation()}
                      >
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                          title="Xem chi tiết"
                          onClick={() => setOpenMenu(null)}
                        >
                          <FaEye className="text-[#0a3d62]" /> Xem chi tiết
                        </Link>
                        <button
                          className={`flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-left ${
                            order.status === 'cancelled' || cancellingId === order._id
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                          title="Huỷ đơn"
                          onClick={() => {
                            setOpenMenu(null);
                            if (!(order.status === 'cancelled' || cancellingId === order._id))
                              handleCancel(order._id);
                          }}
                          disabled={order.status === 'cancelled' || cancellingId === order._id}
                        >
                          <FaTrash className="text-red-600" /> Huỷ đơn
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
