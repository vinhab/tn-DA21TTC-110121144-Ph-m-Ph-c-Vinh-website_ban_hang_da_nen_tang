// components/FilterModal.tsx
import React, { Dispatch, SetStateAction } from 'react';

export type FilterState = {
  category: string;
  brand: string;
  priceFrom: string;
  priceTo: string;
};

type FilterModalProps = {
  open: boolean;
  onClose: () => void;
  categories: { slug: string; name: string }[];
  brands: string[];
  filter: FilterState;
  setFilter: Dispatch<SetStateAction<FilterState>>;
  onApply: () => void;
};

export default function FilterModal({
  open,
  onClose,
  categories,
  brands,
  filter,
  setFilter,
  onApply,
}: FilterModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-[95vw] max-w-md relative shadow-lg animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-lg font-bold hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center"
          aria-label="Đóng"
        >
          ×
        </button>
        <h3 className="text-lg font-semibold mb-4">Bộ lọc sản phẩm</h3>
        {/* Danh mục */}
        <div className="mb-3">
          <label className="font-medium text-sm mb-1 block">Danh mục</label>
          <select
            value={filter.category}
            onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Tất cả</option>
            {categories.map(c => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {/* Giá */}
        <div className="mb-3 flex gap-2">
          <div>
            <label className="text-xs block">Giá từ</label>
            <input
              type="number"
              value={filter.priceFrom}
              onChange={e => setFilter(f => ({ ...f, priceFrom: e.target.value }))}
              placeholder="₫"
              className="w-24 border rounded px-2 py-1"
              min={0}
            />
          </div>
          <div>
            <label className="text-xs block">Đến</label>
            <input
              type="number"
              value={filter.priceTo}
              onChange={e => setFilter(f => ({ ...f, priceTo: e.target.value }))}
              placeholder="₫"
              className="w-24 border rounded px-2 py-1"
              min={0}
            />
          </div>
        </div>
        {/* Brand */}
        <div className="mb-3">
          <label className="font-medium text-sm mb-1 block">Thương hiệu</label>
          <select
            value={filter.brand}
            onChange={e => setFilter(f => ({ ...f, brand: e.target.value }))}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Tất cả</option>
            {brands.map(b => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        {/* Nút áp dụng */}
        <div className="mt-4">
          <button
            className="bg-[#22223b] text-white px-4 py-2 rounded-full w-full hover:bg-[#37375a] transition"
            onClick={() => {
              onApply();
              onClose();
            }}
          >
            Áp dụng bộ lọc
          </button>
        </div>
      </div>
    </div>
  );
}
