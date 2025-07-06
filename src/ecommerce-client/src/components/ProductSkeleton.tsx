export default function ProductSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded shadow p-3">
      <div className="bg-gray-200 h-40 rounded w-full mb-2" />
      <div className="h-4 bg-gray-300 w-5/6 mb-2 rounded" />
      <div className="h-3 bg-gray-300 w-1/2 mb-2 rounded" />
      <div className="h-3 bg-gray-200 w-2/3 rounded" />
    </div>
  )
}
