'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchUserById, blockUser, unblockUser, updateUser, fetchOrdersByUserId } from '@/lib/api';
import { FaLock, FaUnlock, FaSave, FaUserCheck, FaUserTimes } from 'react-icons/fa';

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userIdRaw = params.id;

  if (!userIdRaw || Array.isArray(userIdRaw)) {
    throw new Error('User ID không hợp lệ');
  }
  const userId: string = userIdRaw;

  // User info state
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // User fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState<'nam' | 'nu' | undefined>(undefined);
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [isBlocked, setIsBlocked] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      try {
        const data = await fetchUserById(userId);
        setUser(data);
        setName(data.name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
        setBirthday(data.birthday || '');
        setGender(data.gender === 'nam' || data.gender === 'nu' ? data.gender : undefined);
        setRole(data.role || 'user');
        setIsBlocked(data.isBlocked || false);
        setIsVerified(data.isVerified || false);
        setAvatarUrl(data.avatarUrl || '');
      } catch {
        alert('Lỗi tải thông tin người dùng');
        router.back();
      } finally {
        setLoading(false);
      }
    }

    async function loadOrders() {
      setLoadingOrders(true);
      try {
        const ordersData = await fetchOrdersByUserId(userId);
        setOrders(ordersData || []);
      } catch {
        // lỗi lấy đơn hàng thì thôi
      } finally {
        setLoadingOrders(false);
      }
    }

    if (userId) {
      loadUser();
      loadOrders();
    }
  }, [userId, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData: Partial<{
        name: string;
        phone: string;
        address: string;
        birthday: string;
        role: 'user' | 'admin';
        gender?: 'nam' | 'nu';
      }> = { name, phone, address, birthday, role };

      if (gender === 'nam' || gender === 'nu') {
        updateData.gender = gender;
      }

      await updateUser(userId, updateData);
      alert('Cập nhật thông tin thành công');
    } catch {
      alert('Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const toggleBlock = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (isBlocked) {
        await unblockUser(userId);
        setIsBlocked(false);
        alert('Mở khóa user thành công');
      } else {
        await blockUser(userId);
        setIsBlocked(true);
        alert('Khóa user thành công');
      }
    } catch {
      alert('Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Đang tải...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white rounded shadow overflow-x-auto">
      <button
        onClick={() => router.back()}
        className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center gap-2"
      >
        ← Quay lại
      </button>

      <h1 className="text-3xl font-bold mb-6">Chi tiết người dùng</h1>

      {/* User Info */}
      <div className="flex items-center gap-4">
        <img
          src={avatarUrl || `https://i.pravatar.cc/150?u=${userId}`}
          alt={name}
          className="w-24 h-24 rounded-full object-cover border"
        />
        <div>
          <p className="font-semibold text-lg">{name}</p>
          <p className="text-gray-600">{email}</p>
          <p className={`mt-1 font-semibold ${isVerified ? 'text-green-600' : 'text-red-600'}`}>
            {isVerified ? (
              <>
                <FaUserCheck className="inline mr-1" /> Đã xác minh email
              </>
            ) : (
              <>
                <FaUserTimes className="inline mr-1" /> Chưa xác minh email
              </>
            )}
          </p>
          <p className={`mt-1 font-semibold ${isBlocked ? 'text-red-600' : 'text-green-600'}`}>
            {isBlocked ? (
              <>
                <FaLock className="inline mr-1" /> Tài khoản bị khóa
              </>
            ) : (
              'Tài khoản hoạt động'
            )}
          </p>
        </div>
      </div>

      {/* Edit form */}
      <div className="space-y-4">
        <label className="block">
          <span className="font-semibold">Tên</span>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </label>

        <label className="block">
          <span className="font-semibold">Số điện thoại</span>
          <input
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </label>

        <label className="block">
          <span className="font-semibold">Địa chỉ</span>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </label>

        <label className="block">
          <span className="font-semibold">Ngày sinh</span>
          <input
            type="date"
            value={birthday}
            onChange={e => setBirthday(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </label>

        <label className="block">
          <span className="font-semibold">Giới tính</span>
          <select
            value={gender || ''}
            onChange={e => {
              const val = e.target.value;
              setGender(val === 'nam' || val === 'nu' ? val : undefined);
            }}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Chọn giới tính</option>
            <option value="nam">Nam</option>
            <option value="nu">Nữ</option>
          </select>
        </label>

        <label className="block">
          <span className="font-semibold">Vai trò</span>
          <select
            value={role}
            onChange={e => setRole(e.target.value as 'user' | 'admin')}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="user">Người dùng</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={toggleBlock}
          className={`flex items-center gap-2 px-4 py-2 rounded text-white ${
            isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isBlocked ? <FaUnlock /> : <FaLock />}
          {isBlocked ? 'Mở khóa' : 'Khóa user'}
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
        >
          <FaSave />
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      {/* Đơn hàng gần đây */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Đơn hàng gần đây</h2>
        {loadingOrders ? (
          <p>Đang tải đơn hàng...</p>
        ) : orders.length === 0 ? (
          <p>Người dùng chưa có đơn hàng nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border border-gray-300 text-left">Mã đơn hàng</th>
                  <th className="p-2 border border-gray-300 text-left">Ngày đặt</th>
                  <th className="p-2 border border-gray-300 text-left">Tổng tiền</th>
                  <th className="p-2 border border-gray-300 text-left">Trạng thái</th>
                  <th className="p-2 border border-gray-300 text-left">Xem chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(order => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="p-2 border border-gray-300">{order.orderCode || order._id}</td>
                    <td className="p-2 border border-gray-300">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2 border border-gray-300">
                      {order.total?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '-'}
                    </td>
                    <td className="p-2 border border-gray-300">{order.status}</td>
                    <td className="p-2 border border-gray-300">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => router.push(`/admin/orders/${order._id}`)}
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length > 5 && (
              <button
                className="mt-3 text-blue-600 hover:underline"
                onClick={() => router.push(`/admin/users/${userId}/orders`)}
              >
                Xem tất cả đơn hàng
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
