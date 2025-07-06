'use client'

import Image from 'next/image'
import { useState } from 'react'
import { UIProduct } from '@/types/product-ui'
import Link from 'next/link'

interface Props {
  groupedSuggestions: Record<string, UIProduct[]>
}

export default function GroupedSuggestions({ groupedSuggestions }: Props) {
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  if (!groupedSuggestions || Object.keys(groupedSuggestions).length === 0) return null

  return (
    <div>
      <span className="px-4 py-1.5 text-red-600 border border-red-600 bg-red-50 rounded font-semibold text-md">
        Sản phẩm mua kèm
      </span>
      <br />
      <br />
      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-[600px]">
          {Object.entries(groupedSuggestions).map(([label, products]) => (
            <div
              key={label}
              onClick={() => setOpenGroup(label)}
              className="cursor-pointer min-w-[150px] max-w-[160px] bg-white border rounded-lg shadow-sm hover:shadow-md p-3 flex-shrink-0 flex flex-col items-center text-center transition"
            >
              <Image
                src={products[0]?.imageUrl || '/placeholder.png'}
                alt={label}
                width={120}
                height={120}
                className="object-contain h-28 w-auto"
              />
              <p className="mt-3 font-semibold text-gray-700">Mua kèm {label}</p>
            </div>
          ))}
        </div>

      </div>

      {openGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 max-w-5xl w-full rounded shadow relative max-h-[90vh] overflow-auto">
            <button
              className="absolute top-2 right-4 text-xl"
              onClick={() => setOpenGroup(null)}
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4">Mua kèm {openGroup}</h3>

            {groupedSuggestions[openGroup]?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {groupedSuggestions[openGroup].map((p) => (
                  <div
                    key={p.id}
                    className="border p-2 rounded text-sm flex flex-col items-center"
                  >
                    <Image
                      src={p.imageUrl || '/placeholder.png'}
                      alt={p.name}
                      width={160}
                      height={100}
                      className="w-full h-24 object-contain"
                    />
                    <p className="mt-2 line-clamp-2 text-center">{p.name}</p>
                    <p className="text-red-600 font-bold mt-1">
                      {p.price.toLocaleString()}₫
                    </p>
                    <Link href={`/products/${p.id}`} className="w-full mt-2">
                      <button className="w-full py-1 text-white bg-red-500 rounded hover:bg-red-600 text-sm">
                        Xem chi tiết
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 italic">
                Không có sản phẩm nào trong nhóm này.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
