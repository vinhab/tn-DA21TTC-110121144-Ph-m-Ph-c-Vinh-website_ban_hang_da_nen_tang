'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { createProduct, fetchCategories } from '@/lib/api';
import { Category } from '@/types/product';
import { toast } from 'react-hot-toast';

type AddProductFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

export default function AddProductForm({ onSuccess, onCancel }: AddProductFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [specText, setSpecText] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [parentId, setParentId] = useState('');
  const [variantAttributes, setVariantAttributes] = useState('');

  // Ảnh đại diện
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Gallery mới (thêm mới chỉ)
  const [galleryNewFiles, setGalleryNewFiles] = useState<File[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error('Lỗi tải danh mục:', error);
        toast.error('Lỗi tải danh mục');
      }
    }
    loadCategories();
  }, []);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAddNewGalleryFiles = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setGalleryNewFiles([...galleryNewFiles, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name || !price || !categoryId) {
      toast.error('Vui lòng nhập đủ tên, giá và chọn danh mục sản phẩm');
      return;
    }

    if (!avatarFile) {
      toast.error('Vui lòng chọn ảnh đại diện');
      return;
    }

    let specifications = {};
    try {
      if (specText.trim()) specifications = JSON.parse(specText);
    } catch {
      toast.error('Thông số kỹ thuật phải là JSON hợp lệ');
      return;
    }

    let variantAttrs = {};
    try {
      if (variantAttributes.trim()) variantAttrs = JSON.parse(variantAttributes);
    } catch {
      toast.error('Thuộc tính biến thể phải là JSON hợp lệ');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('stock', stock || '0');
    formData.append('categoryId', categoryId);
    if (originalPrice) formData.append('originalPrice', originalPrice);
    if (brand) formData.append('brand', brand);
    if (description) formData.append('description', description);
    if (parentId) formData.append('parentId', parentId);
    formData.append('isActive', String(isActive));
    formData.append('specifications', JSON.stringify(specifications));
    formData.append('variantAttributes', JSON.stringify(variantAttrs));

    formData.append('image', avatarFile);
    galleryNewFiles.forEach(file => formData.append('gallery', file));

    try {
      await createProduct(formData);
      toast.success('Thêm sản phẩm thành công');
      onSuccess();
    } catch (error: any) {
      console.error('Lỗi khi thêm sản phẩm:', error);
      toast.error('Lỗi khi thêm sản phẩm');
    }
  };

  return (
    <div className="w-full overflow-x-auto px-2">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-full md:max-w-[1000px] mx-auto p-4 md:p-6 border rounded-lg shadow-md bg-white"
      >
        <h2 className="text-xl font-bold mb-4">Thêm sản phẩm mới</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Tên sản phẩm"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-3 py-1.5 border border-gray-300 rounded"
            />
            <input
              type="number"
              placeholder="Giá bán"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
              className="w-full px-3 py-1.5 border border-gray-300 rounded"
            />
            <input
              type="number"
              placeholder="Tồn kho"
              value={stock}
              onChange={e => setStock(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded"
            />
            <input
              type="number"
              placeholder="Giá gốc (originalPrice)"
              value={originalPrice}
              onChange={e => setOriginalPrice(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Thương hiệu"
              value={brand}
              onChange={e => setBrand(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded"
            />
            <label className="block font-semibold">Danh mục</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              required
              className="w-full px-3 py-1.5 border border-gray-300 rounded"
            >
              <option value="">Chọn danh mục</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <textarea
              placeholder="Mô tả sản phẩm"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded h-16"
            />
          </div>
          <div className="space-y-3">
            {avatarPreview && (
              <img
                src={avatarPreview}
                alt="Ảnh đại diện"
                className="w-32 h-32 object-cover rounded mb-2"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="w-full"
            />
            <textarea
              placeholder="Thông số kỹ thuật (JSON)"
              value={specText}
              onChange={e => setSpecText(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded h-16"
              spellCheck={false}
            />
            <input
              type="text"
              placeholder="Parent ID (nếu là biến thể)"
              value={parentId}
              onChange={e => setParentId(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded"
            />
            <textarea
              placeholder="Thuộc tính biến thể (JSON)"
              value={variantAttributes}
              onChange={e => setVariantAttributes(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded h-16"
              spellCheck={false}
            />
            <label className="block font-semibold mb-1">Thêm ảnh nhỏ mới</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleAddNewGalleryFiles}
              className="w-full"
            />
            <label className="flex items-center space-x-2 mt-4">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
              />
              <span>Sản phẩm đang hoạt động</span>
            </label>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#0a3d62] text-white rounded"
          >
            Thêm sản phẩm
          </button>
        </div>
      </form>
    </div>
  );
}
