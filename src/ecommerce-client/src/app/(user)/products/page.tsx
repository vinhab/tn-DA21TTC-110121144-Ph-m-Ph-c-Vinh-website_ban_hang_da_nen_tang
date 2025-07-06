'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import FilterModal, { FilterState } from '@/components/FilterModal';
import { fetchProducts } from '@/lib/api';
import { mapApiProductsList } from '@/utils/product-mapping';

const categories = [
  { slug: 'laptop', name: 'Laptop' },
  { slug: 'pc', name: 'PC' },
  { slug: 'monitor', name: 'Màn hình' },
  { slug: 'mouse', name: 'Chuột' },
  { slug: 'keyboard', name: 'Bàn phím' },
];
const brands = ['Apple', 'Lenovo', 'Asus', 'Dell', 'Acer', 'MSI', 'LG', 'Khác'];
const sorts = [
  { value: '', label: 'Mặc định' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'bestseller', label: 'Bán chạy' },
];

export default function ProductsByCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filter, setFilter] = useState<FilterState>({
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    priceFrom: searchParams.get('from') || '',
    priceTo: searchParams.get('to') || '',
  });
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [showFilter, setShowFilter] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tất cả sản phẩm (bạn có thể dùng API filter trên backend cho hiệu quả)
  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then(res => setProducts(mapApiProductsList(res)))
      .finally(() => setLoading(false));
  }, []);

  // Lọc và sắp xếp trên client (demo, nếu nhiều sản phẩm nên filter tại backend)
  let filtered = products
    .filter(p => !filter.category || p.category === filter.category)
    .filter(p => !filter.brand || (p.brand && p.brand.toLowerCase().includes(filter.brand.toLowerCase())))
    .filter(p => !filter.priceFrom || p.price >= parseInt(filter.priceFrom))
    .filter(p => !filter.priceTo || p.price <= parseInt(filter.priceTo));
  if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);

  // Áp dụng filter lên URL (SEO, có thể dùng router.replace để ko reload)
  function applyFilter() {
    let url = '/products?';
    if (filter.category) url += `category=${filter.category}&`;
    if (filter.brand) url += `brand=${filter.brand}&`;
    if (filter.priceFrom) url += `from=${filter.priceFrom}&`;
    if (filter.priceTo) url += `to=${filter.priceTo}&`;
    if (sort) url += `sort=${sort}`;
    router.push(url.replace(/&$/, ''));
  }

  return (
    <div className="bg-[#f4f6fa] min-h-screen py-6">
      <div className="max-w-screen-xl mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">
            Sản phẩm {filter.category && `- ${categories.find(c => c.slug === filter.category)?.name}`}
          </h1>
          <div className="flex gap-2">
            <button
              className="bg-[#22223b] text-white px-4 py-2 rounded-full"
              onClick={() => setShowFilter(true)}
            >
              Bộ lọc
            </button>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="border rounded px-3 py-2"
            >
              {sorts.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Modal filter */}
        <FilterModal
          open={showFilter}
          onClose={() => setShowFilter(false)}
          categories={categories}
          brands={brands}
          filter={filter}
          setFilter={setFilter}
          onApply={applyFilter}
        />
        {/* Sản phẩm */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {!loading && filtered.length === 0 && (
          <div className="text-center text-gray-400 py-10">Không có sản phẩm nào.</div>
        )}
        {loading && (
          <div className="text-center text-gray-400 py-10">Đang tải...</div>
        )}
      </div>
    </div>
  );
}
