'use client'
import { FiBox, FiUser, FiClipboard, FiDollarSign } from 'react-icons/fi'

export default function DashboardOverview() {
  const stats = [
    {
      title: 'Tổng sản phẩm',
      icon: <FiBox className="text-2xl text-blue-500" />,
      value: 120,
    },
    {
      title: 'Người dùng',
      icon: <FiUser className="text-2xl text-green-500" />,
      value: 315,
    },
    {
      title: 'Đơn hàng',
      icon: <FiClipboard className="text-2xl text-yellow-500" />,
      value: 87,
    },
    {
      title: 'Doanh thu',
      icon: <FiDollarSign className="text-2xl text-red-500" />,
      value: '$42,300',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl shadow p-4 flex items-center gap-4 hover:shadow-md transition"
        >
          <div className="p-3 bg-gray-100 rounded-full">
            {stat.icon}
          </div>
          <div>
            <div className="text-gray-500 text-sm">{stat.title}</div>
            <div className="text-lg font-semibold">{stat.value}</div>
          </div>
        </div>
      ))}
    </div>
  )
}