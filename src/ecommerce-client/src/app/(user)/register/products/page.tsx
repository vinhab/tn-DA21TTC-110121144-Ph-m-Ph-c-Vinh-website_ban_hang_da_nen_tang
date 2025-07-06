// ProductListPage.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { UIProduct } from '@/types/product-ui'
import { fetchProducts } from '@/lib/api'
import ProductSection from '@/components/ProductSection'
import LoadingSection from '@/components/LoadingSection'
import { mapApiProductsList } from '@/utils/product-mapping'
import * as Slider from '@radix-ui/react-slider'
import { FaFilter, FaChevronDown } from 'react-icons/fa'
import SortDropdown from '@/components/SortDropdown'

function extractSpecsOptions(products: UIProduct[], keys: string[]) {
    const result: Record<string, Set<string>> = {}
    for (const key of keys) result[key] = new Set()
    products.forEach((p) => {
        keys.forEach((key) => {
            const val = p.specs?.[key]
            if (val) result[key].add(val)
        })
    })
    return Object.entries(result).map(([key, set]) => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        options: Array.from(set),
    }))
}

export default function ProductListPage() {
    const searchParams = useSearchParams()
    const category = searchParams.get('category') || ''
    const [products, setProducts] = useState<UIProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState<Record<string, string>>({})
    const [dynamicFilters, setDynamicFilters] = useState<
        { key: string; label: string; options: string[] }[]
    >([])
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000])
    const [tempRange, setTempRange] = useState<[number, number]>([0, 50000000])
    const [showPricePopup, setShowPricePopup] = useState(false)
    const [sort, setSort] = useState('featured')
    const priceRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (priceRef.current && !priceRef.current.contains(e.target as Node)) {
                setShowPricePopup(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        setLoading(true)
        fetchProducts()
            .then((res) => {
                const all = mapApiProductsList(res)
                const byCategory = all.filter((p) => !category || p.category === category)
                const filterKeys = {
                    laptop: ['cpu', 'ram', 'storage'],
                    monitor: ['size', 'refresh', 'resolution'],
                    mouse: ['wired', 'led', 'type', 'color', 'battery']
                }[category] || []
                setDynamicFilters(extractSpecsOptions(byCategory, filterKeys))

                let filtered = byCategory.filter((p) =>
                    Object.entries(filters).every(([key, val]) =>
                        !val || p.specs?.[key]?.toLowerCase() === val.toLowerCase()
                    )
                )
                filtered = filtered.filter(
                    (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
                )
                if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price)
                if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price)
                if (sort === 'name-asc') filtered.sort((a, b) => a.name.localeCompare(b.name))
                if (sort === 'name-desc') filtered.sort((a, b) => b.name.localeCompare(a.name))
                setProducts(filtered)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [category, filters, priceRange, sort])

    const filterDefinitions = [
        ...(category === 'laptop' || category === 'monitor' || category === 'mouse' ? dynamicFilters : []),
    ]

    return (
        <div className="max-w-screen-xl mx-auto px-4 py-6">
            <nav className="text-sm text-gray-500 mb-4">
                <span className="text-blue-600 hover:underline cursor-pointer">Trang chủ</span>
                {' / '}{category.charAt(0).toUpperCase() + category.slice(1)}
            </nav>

            <div className="bg-white p-4 rounded-lg shadow flex flex-wrap items-center gap-4 justify-between mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    <button className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm bg-white hover:border-blue-500 shadow-sm">
                        <FaFilter className="text-gray-600" />
                        Bộ lọc
                    </button>

                    {filterDefinitions.map((f) => (
                        <select
                            key={f.key}
                            value={filters[f.key] || ''}
                            onChange={(e) => setFilters((prev) => ({ ...prev, [f.key]: e.target.value }))}
                            className="border px-3 py-2 rounded text-sm min-w-[140px] hover:border-blue-500"
                        >
                            <option value="">{f.label}</option>
                            {f.options.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    ))}

                    <div className="relative" ref={priceRef}>
                        <button
                            onClick={() => setShowPricePopup(!showPricePopup)}
                            className="flex items-center gap-2 border px-3 py-2 rounded text-sm bg-white hover:border-blue-500"
                        >
                            Giá: {priceRange[0] / 1e6}tr - {priceRange[1] / 1e6}tr
                            <FaChevronDown className="text-gray-500 text-xs" />
                        </button>

                        {showPricePopup && (
                            <div className="absolute top-12 left-0 z-50 bg-white p-4 shadow-lg rounded-lg w-72">
                                <div className="mb-2 text-sm font-medium">Khoảng giá (VNĐ)</div>
                                <Slider.Root
                                    className="relative flex items-center w-full h-5"
                                    min={0}
                                    max={50000000}
                                    step={500000}
                                    value={tempRange}
                                    onValueChange={(v) => setTempRange([v[0], v[1]])}
                                >
                                    <Slider.Track className="bg-gray-200 grow rounded-full h-1">
                                        <Slider.Range className="absolute bg-green-500 rounded-full h-full" />
                                    </Slider.Track>
                                    <Slider.Thumb className="block w-4 h-4 bg-white border border-green-600 rounded-full shadow" />
                                    <Slider.Thumb className="block w-4 h-4 bg-white border border-green-600 rounded-full shadow" />
                                </Slider.Root>
                                <div className="flex justify-between mt-2 mb-4 text-sm">
                                    <input
                                        type="number"
                                        className="border px-2 py-1 rounded w-[45%]"
                                        value={tempRange[0]}
                                        onChange={(e) => setTempRange([+e.target.value, tempRange[1]])}
                                    />
                                    <input
                                        type="number"
                                        className="border px-2 py-1 rounded w-[45%]"
                                        value={tempRange[1]}
                                        onChange={(e) => setTempRange([tempRange[0], +e.target.value])}
                                    />
                                </div>
                                <div className="flex justify-between">
                                    <button
                                        onClick={() => {
                                            setTempRange([0, 50000000])
                                            setPriceRange([0, 50000000])
                                            setShowPricePopup(false)
                                        }}
                                        className="text-red-500 border border-red-500 px-3 py-1 rounded text-sm"
                                    >
                                        Bỏ chọn
                                    </button>
                                    <button
                                        onClick={() => {
                                            setPriceRange(tempRange)
                                            setShowPricePopup(false)
                                        }}
                                        className="bg-blue-600 text-white px-4 py-1 rounded text-sm"
                                    >
                                        Xem kết quả
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="min-w-[160px]">
                    <SortDropdown value={sort} onChange={setSort} />
                </div>
            </div>

            {loading ? (
                <LoadingSection count={3} />
            ) : products.length === 0 ? (
                <div className="text-center text-gray-600 py-12">
                    😥 Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.
                </div>
            ) : (
                <ProductSection title="" products={products} />
            )}
        </div>
    )
}
