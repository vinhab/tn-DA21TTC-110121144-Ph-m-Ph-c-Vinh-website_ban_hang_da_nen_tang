'use client';

import { useState, useEffect } from 'react';
import { updateCategory } from '@/lib/api';
import { FaTimes } from 'react-icons/fa';

interface Category {
  _id: string;
  name: string;
  icon?: string;
  description?: string;
  isActive: boolean;
}

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: Category | null;
}

export default function EditCategoryModal({
  isOpen,
  onClose,
  onSuccess,
  category,
}: EditCategoryModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon || '');
      setDescription(category.description || '');
      setIsActive(category.isActive);
    }
  }, [category]);

  if (!isOpen || !category) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCategory(category!._id, {
        name,
        icon,
        description,
        isActive,
      });
      onSuccess();
      onClose();
    } catch (error) {
      alert('Lỗi khi cập nhật danh mục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
          aria-label="Đóng"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Sửa danh mục</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Tên danh mục"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="Icon (tùy chọn)"
            value={icon}
            onChange={e => setIcon(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          <textarea
            placeholder="Mô tả (tùy chọn)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
            />
            Hiển thị danh mục
          </label>
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật danh mục'}
          </button>
        </form>
      </div>
    </div>
  );
}
