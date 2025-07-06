'use client';

import { useState } from 'react';
import { createCategory } from '@/lib/api';
import { FaTimes } from 'react-icons/fa';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // gọi khi thêm thành công để reload danh sách
}

export default function AddCategoryModal({ isOpen, onClose, onSuccess }: AddCategoryModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCategory({ name, icon, description });
      onSuccess();
      onClose();
      setName('');
      setIcon('');
      setDescription('');
    } catch (error) {
      alert('Lỗi khi thêm danh mục');
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

        <h2 className="text-xl font-semibold mb-4">Thêm danh mục</h2>
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
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? 'Đang thêm...' : 'Thêm danh mục'}
          </button>
        </form>
      </div>
    </div>
  );
}
