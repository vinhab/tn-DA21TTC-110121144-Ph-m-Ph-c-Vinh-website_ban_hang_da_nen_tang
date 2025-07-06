'use client'
import { useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { importProductsFromExcel } from '@/lib/api'

interface ImportExcelModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ImportExcelModal({
    open,
    onClose,
    onSuccess
}: ImportExcelModalProps) {
    const fileInput = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)

    if (!open) return null

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        const file = fileInput.current?.files?.[0]
        if (!file) return toast.error('Vui lòng chọn file Excel!')
        setLoading(true)
        try {
            await importProductsFromExcel(file)
            toast.success('Import thành công!')
            onSuccess && onSuccess()
            onClose && onClose()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Import thất bại!')
        }
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <form
                className="bg-white rounded-lg p-6 w-full max-w-sm"
                onSubmit={handleUpload}
            >
                <h2 className="text-lg font-bold mb-4">Nhập sản phẩm từ Excel</h2>
                <input
                    type="file"
                    accept=".xlsx,.xls"
                    ref={fileInput}
                    className="mb-4"
                />
                <div className="flex gap-2 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
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
                    <a
                        href="/file-mau-import-san-pham.xlsx"
                        download
                        className="text-blue-600 underline"
                    >
                        Tải file mẫu
                    </a>
                </div>
            </form>
        </div>
    )
}
