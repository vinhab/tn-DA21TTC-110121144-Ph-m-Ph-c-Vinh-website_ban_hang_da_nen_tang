'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { createProduct } from '@/lib/api';

export default function AddProductForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [specText, setSpecText] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleGalleryChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setGalleryFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name || !price) {
      alert('Vui lòng nhập đủ tên và giá sản phẩm');
      return;
    }

    let specifications = {};
    if (specText.trim()) {
      try {
        specifications = JSON.parse(specText);
      } catch {
        alert('Specifications phải là JSON hợp lệ');
        return;
      }
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('stock', stock || '0');

    if (originalPrice) formData.append('originalPrice', originalPrice);
    if (brand) formData.append('brand', brand);
    if (categoryId) formData.append('categoryId', categoryId);
    formData.append('specifications', JSON.stringify(specifications));

    if (avatarFile) {
      formData.append('image', avatarFile);
    }

    galleryFiles.forEach(file => {
      formData.append('gallery', file);
    });

    try {
      await createProduct(formData);
      alert('Thêm sản phẩm thành công');
      onSuccess();
      // reset form
      setName('');
      setPrice('');
      setStock('');
      setOriginalPrice('');
      setBrand('');
      setCategoryId('');
      setSpecText('');
      setAvatarFile(null);
      setGalleryFiles([]);
    } catch (error) {
      alert('Lỗi khi thêm sản phẩm');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6 p-6 border rounded-lg shadow-md bg-white">
  <div className="grid grid-cols-2 gap-6">
    {/* Cột 1 */}
    <div>
      <label className="block mb-2 font-semibold text-lg text-gray-700">Tên sản phẩm</label>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0a3d62]"
        placeholder="Nhập tên sản phẩm"
        required
      />
    </div>

    {/* Cột 2 */}
    <div>
      <label className="block mb-2 font-semibold text-lg text-gray-700">Giá bán (đ)</label>
      <input
        type="number"
        value={price}
        onChange={e => setPrice(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0a3d62]"
        placeholder="Nhập giá bán"
        required
        min={0}
      />
    </div>

    <div>
      <label className="block mb-2 font-semibold text-lg text-gray-700">Giá gốc (originalPrice)</label>
      <input
        type="number"
        value={originalPrice}
        onChange={e => setOriginalPrice(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0a3d62]"
        placeholder="Nhập giá gốc (nếu có)"
        min={0}
      />
    </div>

    <div>
      <label className="block mb-2 font-semibold text-lg text-gray-700">Tồn kho</label>
      <input
        type="number"
        value={stock}
        onChange={e => setStock(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0a3d62]"
        placeholder="Nhập số lượng tồn kho"
        min={0}
      />
    </div>

    <div>
      <label className="block mb-2 font-semibold text-lg text-gray-700">Thương hiệu</label>
      <input
        type="text"
        value={brand}
        onChange={e => setBrand(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0a3d62]"
        placeholder="Nhập thương hiệu"
      />
    </div>

    <div>
      <label className="block mb-2 font-semibold text-lg text-gray-700">Danh mục (categoryId)</label>
      <input
        type="text"
        value={categoryId}
        onChange={e => setCategoryId(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0a3d62]"
        placeholder="Nhập ID danh mục"
      />
    </div>
  </div>

  {/* Trường này chiếm hết 2 cột (full width) */}
  <div>
    <label className="block mb-2 font-semibold text-lg text-gray-700">Thông số kỹ thuật (JSON)</label>
    <textarea
      value={specText}
      onChange={e => setSpecText(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#0a3d62]"
      rows={5}
      placeholder='Ví dụ: {"CPU":"Intel i5", "RAM":"8GB"}'
    />
  </div>

  <div className="grid grid-cols-2 gap-6">
    <div>
      <label className="block mb-2 font-semibold text-lg text-gray-700">Ảnh đại diện</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="block w-full text-gray-600"
      />
      {avatarFile && <p className="mt-2 text-sm text-gray-600">Đã chọn: {avatarFile.name}</p>}
    </div>

    <div>
      <label className="block mb-2 font-semibold text-lg text-gray-700">Ảnh gallery</label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleGalleryChange}
        className="block w-full text-gray-600"
      />
      {galleryFiles.length > 0 && (
        <p className="mt-2 text-sm text-gray-600">Đã chọn {galleryFiles.length} ảnh</p>
      )}
    </div>
  </div>

  <button
    type="submit"
    className="w-full bg-[#0a3d62] text-white text-lg font-semibold py-3 rounded-lg hover:bg-[#0980b0] transition"
  >
    Thêm sản phẩm
  </button>
</form>

  );
}
