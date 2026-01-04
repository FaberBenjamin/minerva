interface StatCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-minerva-gray-200">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-minerva-gray-600 uppercase tracking-wide">
          {title}
        </p>
        {icon && (
          <div className="text-minerva-gray-400">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-minerva-gray-900">
          {value.toLocaleString('hu-HU')}
        </p>

        {trend && (
          <span className={`text-sm font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
}

export default StatCard;
