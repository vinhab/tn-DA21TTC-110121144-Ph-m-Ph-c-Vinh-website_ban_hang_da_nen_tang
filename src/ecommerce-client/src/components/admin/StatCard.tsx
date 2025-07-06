'use client';

export default function StatCard({
  label,
  value,
  trend,
  color,
  icon,
}: {
  label: string;
  value: string;
  trend: string;
  color: string;
  icon: string;
}) {
  const trendColor = trend.startsWith('-') ? 'text-red-500' : 'text-green-500';

  return (
    <div className="bg-white p-5 rounded shadow hover:shadow-md transition">
      <div className="flex justify-between items-center mb-3">
        <span className={`text-2xl`}>{icon}</span>
        <span className={`text-sm font-medium ${trendColor}`}>{trend}</span>
      </div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
