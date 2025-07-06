'use client';

import { useEffect, useState } from 'react';
import {
  FaUsers, FaShoppingCart, FaBoxOpen, FaDollarSign, FaBell
} from 'react-icons/fa';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  fetchDashboardSummary,
  fetchDashboardRevenue,
  fetchDashboardOrderStatus,
  fetchDashboardTopProducts,
  fetchDashboardLowStockProducts,
  fetchDashboardNewUsers,
  fetchDashboardRecentOrders,
  fetchDashboardNotifications
} from '@/lib/api';
import { toast } from 'react-hot-toast'; // Bổ sung

const statusColors = ['#38b000', '#fbbf24', '#ef4444', '#3366ff', '#00d8e0', '#b267ff'];

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const [topProductsData, setTopProductsData] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [newUsers, setNewUsers] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [
          s, r, os, tp, ls, nu, ro, n
        ] = await Promise.all([
          fetchDashboardSummary(),
          fetchDashboardRevenue(),
          fetchDashboardOrderStatus(),
          fetchDashboardTopProducts(),
          fetchDashboardLowStockProducts(),
          fetchDashboardNewUsers(),
          fetchDashboardRecentOrders(),
          fetchDashboardNotifications()
        ]);
        setSummary(s);
        setRevenueData(r);
        setOrderStatusData(os);
        setTopProductsData(tp);
        setLowStockProducts(ls);
        setNewUsers(nu);
        setRecentOrders(ro);
        setNotifications(n);
      } catch (err) {
        console.error('❌ Lỗi tải dữ liệu dashboard:', err);
        toast.error('❌ Không thể tải dữ liệu dashboard, vui lòng thử lại!');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h1>

      {/* Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <WidgetCard icon={<FaDollarSign />} label="Doanh thu hôm nay" value={summary?.revenueToday?.toLocaleString() + 'đ' || '...'} />
        <WidgetCard icon={<FaShoppingCart />} label="Tổng đơn hàng" value={summary?.totalOrders || '...'} />
        <WidgetCard icon={<FaUsers />} label="Người dùng" value={summary?.totalUsers || '...'} />
        <WidgetCard icon={<FaBoxOpen />} label="Sản phẩm" value={summary?.totalProducts || '...'} />
      </div>

      {/* Chart tổng quan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doanh thu LineChart */}
        <div className="bg-white p-4 rounded-xl shadow col-span-2">
          <h2 className="text-lg font-semibold mb-3">Doanh thu gần đây</h2>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={revenueData}>
              <Line type="monotone" dataKey="revenue" stroke="#0a3d62" strokeWidth={2} />
              <CartesianGrid stroke="#f3f4f6" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Pie chart đơn hàng */}
        <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-3 text-center">Tỉ lệ đơn hàng</h2>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                dataKey="value"
                nameKey="status"
                outerRadius={70}
                label
              >
                {orderStatusData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={statusColors[i % statusColors.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Danh sách & sản phẩm & khách mới */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Top bán chạy */}
        <div className="bg-white p-4 rounded-xl shadow md:col-span-2">
          <h2 className="text-lg font-semibold mb-3">Top sản phẩm bán chạy</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={topProductsData}>
              <CartesianGrid stroke="#f3f4f6" />
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="sold" fill="#0a3d62" />
              <Tooltip />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Đơn mới */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3">Đơn hàng gần đây</h2>
          <ul className="space-y-3 text-sm">
            {recentOrders.map((order, idx) => (
              <li key={idx} className="flex justify-between border-b pb-2">
                <span>#{order.id} - {order.customer}</span>
                <span className={
                  order.status === "Hoàn tất" ? "text-green-600 font-medium" :
                  order.status === "Đã huỷ" ? "text-red-600 font-medium" :
                  "text-yellow-600 font-medium"
                }>{order.status}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Tồn kho thấp + Khách mới */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-3">Tồn kho thấp</h2>
            <ul className="space-y-2 text-sm">
              {lowStockProducts.map(p => (
                <li key={p.name || p._id} className="flex justify-between">
                  <span>{p.name}</span>
                  <span className="text-red-600">{p.stock}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-3">Khách hàng mới</h2>
            <ul className="space-y-2 text-sm">
              {newUsers.map(u => (
                <li key={u.email} className="flex flex-col">
                  <span className="font-medium">{u.name}</span>
                  <span className="text-xs text-gray-500">{u.email}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Thông báo/Activity */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Thông báo gần đây</h2>
        <ul className="space-y-2 text-sm">
          {notifications.map((n, i) => (
            <li
              key={i}
              className={`flex items-center gap-2 ${n.type === 'warning'
                ? 'text-yellow-600'
                : n.type === 'error'
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              <FaBell />
              <span>{n.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// WidgetCard giữ nguyên như cũ
function WidgetCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
      <div className="text-3xl text-[#0a3d62]">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
