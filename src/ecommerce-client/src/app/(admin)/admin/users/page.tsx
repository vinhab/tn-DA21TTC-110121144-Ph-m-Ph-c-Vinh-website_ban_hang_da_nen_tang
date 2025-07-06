'use client';

import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { fetchUsers, blockUser, unblockUser, deleteUser } from '@/lib/api';
import AddUserModal from '@/components/admin/AddUserModal';
import EditUserModal from '@/components/admin/EditUserModal';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface ActionMenuProps {
  onEdit: () => void;
  onToggleBlock: () => void;
  onDelete: () => void;
  isBlocked: boolean;
}

function ActionMenu({ onEdit, onToggleBlock, onDelete, isBlocked }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200"
        aria-label="Menu thao tác"
      >
        <span className="text-xl select-none">⋯</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md z-50">
          <button
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            <FaEdit />
            <span>Sửa</span>
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onToggleBlock();
            }}
            className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            <span>{isBlocked ? 'Mở khóa' : 'Khóa'}</span>
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
          >
            <FaTrash />
            <span>Xóa</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch {
      toast.error('Lỗi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleBlockToggle = (user: any) => {
    const action = user.isBlocked ? 'mở khóa' : 'khóa';
    toast(t => (
      <span>
        <div className="mb-2 font-medium">
          Bạn có chắc muốn {action} user này?
        </div>
        <div className="flex gap-2 justify-end">
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                if (user.isBlocked) {
                  await unblockUser(user._id);
                } else {
                  await blockUser(user._id);
                }
                toast.success(`Đã ${action} user`);
                await loadUsers();
              } catch {
                toast.error(`${action.charAt(0).toUpperCase() + action.slice(1)} thất bại`);
              }
            }}
          >Xác nhận</button>
          <button
            className="px-3 py-1 rounded bg-gray-200 text-sm hover:bg-gray-300"
            onClick={() => toast.dismiss(t.id)}
          >Huỷ</button>
        </div>
      </span>
    ), { duration: 8000 });
  };

  const handleDelete = (id: string) => {
    toast(t => (
      <span>
        <div className="mb-2 font-medium">
          Bạn có chắc muốn xóa user này?
        </div>
        <div className="flex gap-2 justify-end">
          <button
            className="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await deleteUser(id);
                toast.success('Đã xóa user');
                await loadUsers();
              } catch {
                toast.error('Xóa thất bại');
              }
            }}
          >Xác nhận</button>
          <button
            className="px-3 py-1 rounded bg-gray-200 text-sm hover:bg-gray-300"
            onClick={() => toast.dismiss(t.id)}
          >Huỷ</button>
        </div>
      </span>
    ), { duration: 8000 });
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setModalEditOpen(true);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
        <button
          onClick={() => setModalAddOpen(true)}
          className="flex items-center gap-2 bg-[#0a3d62] text-white px-4 py-2 rounded-xl shadow hover:bg-[#0980b0] transition text-base"
        >
          <FaPlus /> Thêm user
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <FaSearch />
        </span>
        <input
          type="text"
          placeholder="Tìm kiếm tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-[#0a3d62] focus:outline-none shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow-md">
          <thead>
            <tr className="bg-[#eaf6fb] text-[#0a3d62] text-left text-sm">
              <th className="px-4 py-3">Avatar</th>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Số điện thoại</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">
                  Đang tải...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">
                  Không có user nào
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr
                  key={u._id}
                  className="border-b last:border-none hover:bg-blue-50 transition"
                >
                  <td className="px-4 py-3">
                    <img
                      src={u.avatarUrl || `https://i.pravatar.cc/150?u=${u._id}`}
                      alt={u.name}
                      className="w-12 h-12 object-cover rounded-full border"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-blue-600 hover:underline cursor-pointer">
                    <Link href={`/admin/users/${u._id}`}>
                      {u.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.phone || '-'}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${u.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}
                    >
                      {u.isBlocked ? 'Bị khóa' : 'Hoạt động'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ActionMenu
                      isBlocked={u.isBlocked}
                      onEdit={() => handleEdit(u)}
                      onToggleBlock={() => handleBlockToggle(u)}
                      onDelete={() => handleDelete(u._id)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddUserModal
        isOpen={modalAddOpen}
        onClose={() => setModalAddOpen(false)}
        onSuccess={() => {
          setModalAddOpen(false);
          loadUsers();
        }}
      />
      <EditUserModal
        isOpen={modalEditOpen}
        onClose={() => setModalEditOpen(false)}
        onSuccess={() => {
          setModalEditOpen(false);
          loadUsers();
        }}
        user={selectedUser}
      />
    </div>
  );
}
