'use client';

import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { updateProduct, fetchCategories, updateProductWithImages } from '@/lib/api';
import { Product, Category } from '@/types/product';
import { toast } from 'react-hot-toast';

type UpdateProductFormProps = {
    product: Product;
    onSuccess: () => void;
    onCancel: () => void;
};

export default function UpdateProductForm({ product, onSuccess, onCancel }: UpdateProductFormProps) {
    const [name, setName] = useState(product.name);
    const [price, setPrice] = useState(product.price.toString());
    const [stock, setStock] = useState(product.stock.toString());
    const [originalPrice, setOriginalPrice] = useState(product.originalPrice?.toString() || '');
    const [brand, setBrand] = useState(product.brand || '');
    const [categoryId, setCategoryId] = useState(product.categoryId?._id || '');
    const [categories, setCategories] = useState<Category[]>([]);
    const [specText, setSpecText] = useState(product.specifications ? JSON.stringify(product.specifications, null, 2) : '');
    const [description, setDescription] = useState(product.description || '');
    const [isActive, setIsActive] = useState(product.isActive ?? true);
    const [parentId, setParentId] = useState(product.parentId || '');
    const [variantAttributes, setVariantAttributes] = useState(product.variantAttributes ? JSON.stringify(product.variantAttributes, null, 2) : '');

    // Ảnh đại diện
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>(product.imageUrl || '');

    // Gallery hiện có (url)
    const [galleryExisting, setGalleryExisting] = useState<string[]>(product.gallery || []);
    // Gallery mới thêm (file)
    const [galleryNewFiles, setGalleryNewFiles] = useState<File[]>([]);
    // Danh sách gallery ảnh cần xóa (url)
    const [galleryRemove, setGalleryRemove] = useState<string[]>([]);

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

    const handleRemoveExistingImage = (url: string) => {
        setGalleryExisting(galleryExisting.filter(img => img !== url));
        setGalleryRemove(prev => [...prev, url]);
    };

    const handleUndoRemoveImage = (url: string) => {
        setGalleryRemove(galleryRemove.filter(img => img !== url));
        setGalleryExisting(prev => [...prev, url]);
    };

    const handleRemoveNewImage = (file: File) => {
        setGalleryNewFiles(galleryNewFiles.filter(f => f !== file));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!name.trim() || isNaN(Number(price)) || !price) {
            toast.error('Tên sản phẩm và giá bán không được bỏ trống!');
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

        // Log dữ liệu trước khi gửi
        console.log('==== Dữ liệu gửi cập nhật sản phẩm ====');
        console.log('Tên:', name, '| Giá:', price, '| Danh mục:', categoryId);
        console.log('galleryExisting:', galleryExisting);
        console.log('galleryNewFiles:', galleryNewFiles);
        console.log('galleryRemove:', galleryRemove);

        if (avatarFile || galleryNewFiles.length > 0 || galleryRemove.length > 0) {
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

            if (avatarFile) formData.append('image', avatarFile);

            galleryNewFiles.forEach(file => formData.append('gallery', file));
            formData.append('galleryRemove', JSON.stringify(galleryRemove));
            formData.append('galleryExisting', JSON.stringify(galleryExisting));

            try {
                await updateProductWithImages(product._id, formData);
                toast.success('Cập nhật sản phẩm thành công');
                onSuccess();
            } catch (error: any) {
                console.error('Lỗi khi cập nhật sản phẩm:', error?.response?.data || error);
                toast.error(
                    'Lỗi khi cập nhật sản phẩm: ' +
                    (error?.response?.data?.message ||
                        error?.message ||
                        JSON.stringify(error?.response?.data) ||
                        'Không rõ nguyên nhân')
                );
            }
        } else {
            const jsonData: any = {
                name,
                price: Number(price),
                stock: Number(stock || '0'),
                categoryId,
                originalPrice: originalPrice ? Number(originalPrice) : undefined,
                brand,
                description,
                parentId,
                isActive,
                specifications,
                variantAttributes: variantAttrs,
            };

            Object.keys(jsonData).forEach(key => {
                if (
                    jsonData[key] === '' ||
                    jsonData[key] === undefined ||
                    (typeof jsonData[key] === 'object' && jsonData[key] !== null && Object.keys(jsonData[key]).length === 0)
                ) {
                    delete jsonData[key];
                }
            });

            console.log('==== JSON gửi updateProduct ====');
            console.log(jsonData);

            try {
                await updateProduct(product._id, jsonData);
                toast.success('Cập nhật sản phẩm thành công');
                onSuccess();
            } catch (error: any) {
                console.error('Lỗi khi cập nhật sản phẩm:', error?.response?.data || error);
                toast.error(
                    'Lỗi khi cập nhật sản phẩm: ' +
                    (error?.response?.data?.message ||
                        error?.message ||
                        JSON.stringify(error?.response?.data) ||
                        'Không rõ nguyên nhân')
                );
            }
        }
    };

    return (
        <div className="w-full overflow-x-auto px-2">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-full md:max-w-[1000px] mx-auto p-4 md:p-6 border rounded-lg shadow-md bg-white"
            >
                <h2 className="text-xl font-bold mb-4">Sửa sản phẩm</h2>
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

                        <div>
                            <label className="block font-semibold mb-1">Ảnh nhỏ hiện có</label>
                            <div className="flex gap-2 overflow-x-auto mb-2">
                                {galleryExisting.map(url => (
                                    <div key={url} className="relative group">
                                        <img
                                            src={url}
                                            alt="gallery"
                                            className="w-20 h-20 object-cover rounded border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExistingImage(url)}
                                            className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1 opacity-80 hover:opacity-100"
                                            title="Xóa ảnh này"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {galleryNewFiles.length > 0 && (
                                <>
                                    <label className="block font-semibold mb-1 mt-2">Ảnh nhỏ mới thêm</label>
                                    <div className="flex gap-2 mb-2">
                                        {galleryNewFiles.map((file, idx) => (
                                            <div key={idx} className="relative group">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt="gallery-new"
                                                    className="w-20 h-20 object-cover rounded border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveNewImage(file)}
                                                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1 opacity-80 hover:opacity-100"
                                                    title="Bỏ ảnh này"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            {galleryRemove.length > 0 && (
                                <div className="mt-2">
                                    <label className="block font-semibold mb-1 text-red-600">Ảnh sẽ bị xóa (bấm để hoàn tác):</label>
                                    <div className="flex gap-2">
                                        {galleryRemove.map(url => (
                                            <div key={url} className="relative group cursor-pointer" title="Khôi phục">
                                                <img
                                                    src={url}
                                                    alt="removed"
                                                    className="w-14 h-14 object-cover rounded border-2 border-dashed border-red-500 opacity-70"
                                                    onClick={() => handleUndoRemoveImage(url)}
                                                />
                                                <span className="absolute top-0 right-0 bg-white text-red-500 font-bold rounded-full text-xs px-1 pointer-events-none">×</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <label className="block font-semibold mb-1 mt-2">Thêm ảnh nhỏ mới</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleAddNewGalleryFiles}
                                className="w-full"
                            />
                        </div>

                        <label className="flex items-center space-x-2 text-sm md:text-base mt-4">
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
                        Cập nhật sản phẩm
                    </button>
                </div>
            </form>
        </div>
    );
}
