'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaEllipsisV } from 'react-icons/fa';
import { fetchCategories, deleteCategory } from '@/lib/api';
import AddCategoryModal from '@/components/admin/AddCategoryModal';
import EditCategoryModal from '@/components/admin/EditCategoryModal';
import { toast } from 'react-hot-toast';

import type { Category } from '@/types/category';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalAddOpen, setModalAddOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();

      // map isActive về boolean (true nếu undefined)
      const mapped = data.map((c: Category) => ({
        ...c,
        isActive: c.isActive === undefined ? true : c.isActive,
      }));

      setCategories(mapped);
    } catch (error) {
      toast.error('Lỗi khi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Đóng menu khi click ngoài
  useEffect(() => {
    function handleClickOutside() {
      setOpenMenu(null);
    }
    if (openMenu) {
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }
  }, [openMenu]);

  const handleDelete = async (id: string) => {
    toast((t) => (
      <span>
        <div className="font-medium mb-1">Bạn có chắc muốn xoá danh mục này?</div>
        <div className="flex gap-3 justify-end">
          <button
            className="px-3 py-1 rounded text-white bg-red-600 hover:bg-red-700 text-sm"
            onClick={async () => {
              toast.dismiss(t.id);
              setDeletingId(id);
              try {
                await deleteCategory(id);
                await loadCategories();
                toast.success('Đã xoá danh mục thành công');
              } catch (err) {
                toast.error('Xoá thất bại');
              } finally {
                setDeletingId(null);
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
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setModalEditOpen(true);
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h1>
        <button
          onClick={() => setModalAddOpen(true)}
          className="flex items-center gap-2 bg-[#0a3d62] text-white px-4 py-2 rounded-xl shadow hover:bg-[#0980b0] transition text-base"
        >
          <FaPlus /> Thêm danh mục
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <FaSearch />
        </span>
        <input
          type="text"
          placeholder="Tìm kiếm danh mục..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-[#0a3d62] focus:outline-none shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow-md">
          <thead>
            <tr className="bg-[#eaf6fb] text-[#0a3d62] text-left text-sm">
              <th className="px-4 py-3">Tên danh mục</th>
              <th className="px-4 py-3">Số sản phẩm</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-400">
                  Đang tải...
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-400">
                  Không có danh mục nào
                </td>
              </tr>
            ) : (
              filteredCategories.map(c => (
                <tr
                  key={c._id}
                  className="border-b last:border-none hover:bg-blue-50 transition"
                >
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.productCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${c.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                        }`}
                    >
                      {c.isActive ? 'Hiện' : 'Ẩn'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center relative h-[44px]"> {/* relative + height */}
                    <button
                      className="w-9 h-9 rounded-full hover:bg-gray-200 flex items-center justify-center
      absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      onClick={e => {
                        e.stopPropagation();
                        setOpenMenu(openMenu === c._id ? null : c._id);
                      }}
                    >
                      <FaEllipsisV />
                    </button>
                    {openMenu === c._id && (
                      <div
                        className="absolute left-1/2 top-full z-50 min-w-[120px] translate-x-[-50%] mt-2 bg-white border rounded shadow text-sm py-1"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setOpenMenu(null);
                            openEditModal(c);
                          }}
                          className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-[#0a3d62]"
                        >
                          <FaEdit /> Sửa
                        </button>
                        <button
                          disabled={deletingId === c._id}
                          onClick={() => {
                            setOpenMenu(null);
                            if (deletingId !== c._id) handleDelete(c._id);
                          }}
                          className={`flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100 text-red-600 ${deletingId === c._id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                          <FaTrash /> Xoá
                        </button>
                      </div>
                    )}
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal thêm danh mục */}
      <AddCategoryModal
        isOpen={modalAddOpen}
        onClose={() => setModalAddOpen(false)}
        onSuccess={() => {
          setModalAddOpen(false);
          loadCategories();
          toast.success('Thêm danh mục thành công');
        }}
      />

      {/* Modal sửa danh mục */}
      {selectedCategory && (
        <EditCategoryModal
          isOpen={modalEditOpen}
          onClose={() => setModalEditOpen(false)}
          onSuccess={() => {
            setModalEditOpen(false);
            loadCategories();
            toast.success('Cập nhật danh mục thành công');
          }}
          category={selectedCategory}
        />
      )}
    </div>
  );
}
