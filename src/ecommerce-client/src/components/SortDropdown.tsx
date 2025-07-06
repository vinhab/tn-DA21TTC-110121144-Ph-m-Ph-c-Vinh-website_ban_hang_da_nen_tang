'use client'

import * as Select from '@radix-ui/react-select'
import { FaSort, FaSortAlphaDown, FaSortAlphaUp, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa'
import { Check } from 'lucide-react'
import { FaChevronDown } from 'react-icons/fa'

const options = [
  { value: 'featured', label: 'Nổi bật', icon: <FaSort /> },
  { value: 'name-asc', label: 'Tên A-Z', icon: <FaSortAlphaDown /> },
  { value: 'name-desc', label: 'Tên Z-A', icon: <FaSortAlphaUp /> },
  { value: 'price-asc', label: 'Giá tăng dần', icon: <FaSortAmountUp /> },
  { value: 'price-desc', label: 'Giá giảm dần', icon: <FaSortAmountDown /> },
]

export default function SortDropdown({ value, onChange }: {
  value: string
  onChange: (val: string) => void
}) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className="inline-flex items-center justify-between border px-3 py-2 rounded text-sm bg-white shadow min-w-[200px]">
        <Select.Value placeholder="Chọn cách sắp xếp..." />
        <FaChevronDown className="ml-2 text-gray-500" />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="bg-white rounded shadow-md z-50">
          <Select.Viewport className="p-1">
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-blue-100 rounded cursor-pointer"
              >
                <Select.ItemText>
                  <div className="flex items-center gap-2">
                    {opt.icon} {opt.label}
                  </div>
                </Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
