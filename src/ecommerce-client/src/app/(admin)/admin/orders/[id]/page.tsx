'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchOrderById, fetchUserById } from '@/lib/api';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();

    const orderIdRaw = params.id;

    if (!orderIdRaw || Array.isArray(orderIdRaw)) {
        throw new Error('Order ID không hợp lệ');
    }
    const orderId: string = orderIdRaw;

    const [order, setOrder] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                // Lấy đơn hàng
                const orderData = await fetchOrderById(orderId);
                setOrder(orderData);

                // Nếu có userId trong đơn, lấy info user
                if (orderData?.userId) {
                    const userData = await fetchUserById(orderData.userId);
                    setUser(userData);
                }
            } catch (error) {
                toast.error('Lỗi tải đơn hàng');
                router.back();
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [orderId, router]);

    if (loading) return <div className="p-6 text-center">Đang tải...</div>;

    if (!order) return <div className="p-6 text-center">Không tìm thấy đơn hàng</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow space-y-6">
            <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center gap-2"
            >
                ← Quay lại
            </button>

            <h1 className="text-3xl font-bold">Chi tiết đơn hàng #{order.orderCode || order._id}</h1>

            <section>
                <h2 className="text-xl font-semibold mb-2">Thông tin khách hàng</h2>
                {user ? (
                    <div>
                        <p><strong>Tên:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Số điện thoại:</strong> {user.phone || '-'}</p>
                        <p><strong>Địa chỉ:</strong> {user.address || '-'}</p>
                    </div>
                ) : (
                    <p>Không có thông tin khách hàng</p>
                )}
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">Thông tin đơn hàng</h2>
                <p><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p><strong>Trạng thái:</strong> {order.status}</p>
                <p><strong>Phương thức thanh toán:</strong> {order.paymentMethod}</p>
                <p><strong>Địa chỉ nhận hàng:</strong> {order.address}</p>
                <p><strong>Số điện thoại nhận hàng:</strong> {order.phone}</p>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">Sản phẩm</h2>
                <table className="min-w-full border border-gray-300 rounded">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border border-gray-300 text-left">Tên sản phẩm</th>
                            <th className="p-2 border border-gray-300 text-left">Giá</th>
                            <th className="p-2 border border-gray-300 text-left">Số lượng</th>
                            <th className="p-2 border border-gray-300 text-left">Tổng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item: any) => (
                            <tr key={item._id} className="hover:bg-gray-50">
                                <td className="p-2 border border-gray-300">
                                    <Link href={`/products/${item.productId}`}>
                                        {item.name}
                                    </Link>
                                </td>
                                <td className="p-2 border border-gray-300">
                                    {item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                </td>
                                <td className="p-2 border border-gray-300">{item.quantity}</td>
                                <td className="p-2 border border-gray-300">
                                    {item.itemTotal.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="text-right text-xl font-semibold">
                Tổng tiền: {order.total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </section>
        </div>
    );
}
