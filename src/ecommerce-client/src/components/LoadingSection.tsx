import ProductSkeleton from './ProductSkeleton'

export default function LoadingSection({ count = 8 }: { count?: number }) {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-300 rounded w-40 animate-pulse" />
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
