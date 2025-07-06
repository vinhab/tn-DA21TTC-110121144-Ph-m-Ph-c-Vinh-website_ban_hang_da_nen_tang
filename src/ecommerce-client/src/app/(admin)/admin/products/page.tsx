'use client';

import { useEffect, useState, useRef } from 'react';
import { FaSearch, FaPlus, FaEllipsisV, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import {
  fetchProducts,
  fetchProductById,
  deleteProduct,
  updateProductActive,
  importProductsFromExcel,
} from '@/lib/api';
import AddProductForm from '@/components/admin/AddProductForm';
import UpdateProductForm from '@/components/admin/UpdateProductForm';
import { Product } from '@/types/product';
import { toast } from 'react-hot-toast';

// --- Hàm chuyển dữ liệu thô sang Product chuẩn ---
function mapRawToProduct(raw: any): Product {
  return {
    ...raw,
    _id: raw._id || raw.id,
    categoryId:
      typeof raw.categoryId === 'object'
        ? raw.categoryId
        : { _id: raw.categoryId, name: 'laptop' },
    stock: raw.stock ?? 0,
    isActive: raw.isActive ?? true,
    specifications: raw.specifications || {},
  };
}

// --- Modal nhập Excel ---
function ImportExcelModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInput.current?.files?.[0];
    if (!file) return toast.error('Vui lòng chọn file Excel!');
    setLoading(true);
    try {
      await importProductsFromExcel(file);
      toast.success('Import thành công!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Import thất bại!');
    }
    setLoading(false);
  };

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleUpload} className="space-y-5 w-full max-w-sm">
        <h2 className="text-lg font-bold text-center mb-2">Nhập sản phẩm từ Excel</h2>
        <input type="file" accept=".xlsx,.xls" ref={fileInput} className="border p-2 rounded w-full" />
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading ? 'Đang tải lên...' : 'Nhập Excel'}
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          <a href="/file-mau-import-san-pham.xlsx" download className="text-blue-600 underline">
            Tải file mẫu
          </a>
        </div>
      </form>
    </Modal>
  );
}

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const [showInactive, setShowInactive] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const loadProducts = async (keyword = '', inactive = false) => {
    setLoading(true);
    try {
      const params: any = {};
      if (keyword) params.search = keyword;
      if (inactive) params.showInactive = true;
      const rawData = await fetchProducts(params);
      console.log('Raw data:', rawData);
      const mapped = rawData.map(mapRawToProduct);
      console.log('mapped data:', mapped);
      setProducts(mapped);
    } catch {
      toast.error('Lỗi tải dữ liệu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts('', showInactive);
  }, [showInactive]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadProducts(search, showInactive);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, showInactive]);

  const handleAddProductSuccess = () => {
    setShowAddModal(false);
    loadProducts(search, showInactive);
  };

  const handleEdit = async (productId: string) => {
    try {
      const raw = await fetchProductById(productId);
      setEditProduct(mapRawToProduct(raw));
      setShowEditModal(true);
    } catch {
      toast.error('Lỗi tải dữ liệu sản phẩm');
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setEditProduct(null);
    loadProducts(search, showInactive);
  };

  const handleDelete = (productId: string) => {
    toast(
      (t) => (
        <span>
          <div className="mb-2 font-medium">Bạn có chắc muốn xóa sản phẩm này không?</div>
          <div className="flex gap-2 justify-end">
            <button
              className="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await deleteProduct(productId);
                  toast.success('Xóa sản phẩm thành công');
                  loadProducts(search, showInactive);
                } catch {
                  toast.error('Xóa sản phẩm thất bại');
                }
              }}
            >
              Xác nhận
            </button>
            <button
              className="px-3 py-1 rounded bg-gray-200 text-sm hover:bg-gray-300"
              onClick={() => toast.dismiss(t.id)}
            >
              Huỷ
            </button>
          </div>
        </span>
      ),
      { duration: 8000 }
    );
  };

  const handleToggleActive = (product: Product) => {
    const action = product.isActive ? 'Ẩn' : 'Hiện';
    toast(
      (t) => (
        <span>
          <div className="mb-2 font-medium">Bạn có chắc muốn {action.toLowerCase()} sản phẩm này không?</div>
          <div className="flex gap-2 justify-end">
            <button
              className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await updateProductActive(product._id, !product.isActive);
                  toast.success(`${action} sản phẩm thành công`);
                  loadProducts(search, showInactive);
                } catch {
                  toast.error(`Không thể ${action.toLowerCase()} sản phẩm`);
                }
              }}
            >
              Xác nhận
            </button>
            <button
              className="px-3 py-1 rounded bg-gray-200 text-sm hover:bg-gray-300"
              onClick={() => toast.dismiss(t.id)}
            >
              Huỷ
            </button>
          </div>
        </span>
      ),
      { duration: 8000 }
    );
  };

  const handleImportSuccess = () => {
    loadProducts(search, showInactive);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 bg-[#0a3d62] text-white px-4 py-2 rounded-xl shadow hover:bg-[#0980b0] transition text-base"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus /> Thêm sản phẩm
          </button>
          <button
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl shadow hover:bg-green-700 transition text-base"
            onClick={() => setShowImportModal(true)}
          >
            <span className="font-bold">⇪</span> Import Excel
          </button>
        </div>
      </div>

      {/* Bộ lọc sản phẩm ẩn */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FaSearch />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-[#0a3d62] focus:outline-none shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showInactive"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          <label htmlFor="showInactive" className="text-sm select-none">
            Hiện cả sản phẩm đã ẩn
          </label>
        </div>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow-md">
          <thead>
            <tr className="bg-[#eaf6fb] text-[#0a3d62] text-left text-sm">
              <th className="px-4 py-3">Ảnh</th>
              <th className="px-4 py-3">Tên sản phẩm</th>
              <th className="px-4 py-3">Giá bán</th>
              <th className="px-4 py-3">Tồn kho</th>
              <th className="px-4 py-3">Danh mục</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">
                  Đang tải...
                </td>
              </tr>
            )}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">
                  Không có sản phẩm nào
                </td>
              </tr>
            )}
            {!loading &&
              products.map((p) => (
                <tr key={p._id} className="border-b last:border-none hover:bg-blue-50 transition">
                  <td className="px-4 py-3">
                    <img
                      src={p.thumbnailUrl || p.imageUrl}
                      alt={p.name}
                      className="w-14 h-14 object-cover rounded shadow"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">{p.price.toLocaleString()}đ</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">{p.categoryLabel}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {p.isActive ? 'Hiện' : 'Ẩn'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ActionMenu
                      onEdit={() => handleEdit(p._id)}
                      onDelete={() => handleDelete(p._id)}
                      onToggleActive={() => handleToggleActive(p)}
                      isActive={p.isActive}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm sản phẩm */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <AddProductForm onSuccess={handleAddProductSuccess} onCancel={() => setShowAddModal(false)} />
        </Modal>
      )}

      {/* Modal Sửa sản phẩm */}
      {showEditModal && editProduct && (
        <Modal onClose={() => setShowEditModal(false)}>
          <UpdateProductForm
            product={editProduct}
            onSuccess={handleEditSuccess}
            onCancel={() => setShowEditModal(false)}
          />
        </Modal>
      )}

      {/* Modal Import Excel */}
      {showImportModal && (
        <ImportExcelModal
          open={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
}

// --- Menu thao tác ---
function ActionMenu({
  onEdit,
  onDelete,
  onToggleActive,
  isActive,
}: {
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleToggle = () => setOpen((prev) => !prev);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={handleToggle}
        tabIndex={0}
      >
        <FaEllipsisV />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-[9999] mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg">
          <button
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-left"
          >
            <FaEdit /> Sửa
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-left text-red-600"
          >
            <FaTrash /> Xóa
          </button>
          <button
            title={isActive ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}
            className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-left ${
              isActive ? 'text-gray-700' : 'text-orange-700'
            }`}
            onClick={() => {
              setOpen(false);
              onToggleActive();
            }}
          >
            {isActive ? <FaEyeSlash /> : <FaEye />} {isActive ? 'Ẩn' : 'Hiện'}
          </button>
        </div>
      )}
    </div>
  );
}

// --- Modal Wrapper (dùng chung cho các modal) ---
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[99999] overflow-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[90vw] min-w-[300px] md:min-w-[800px] bg-white rounded-lg p-6 overflow-x-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
