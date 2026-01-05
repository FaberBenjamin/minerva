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
    <div className="rounded-lg shadow p-6 border" style={{
      backgroundColor: 'var(--theme-card-bg)',
      borderColor: 'var(--theme-card-border)'
    }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium uppercase tracking-wide" style={{
          color: 'var(--theme-text-tertiary)'
        }}>
          {title}
        </p>
        {icon && (
          <div style={{ color: 'var(--theme-text-tertiary)' }}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>
          {value.toLocaleString('hu-HU')}
        </p>

        {trend && (
          <span className="text-sm font-medium" style={{
            color: trend.isPositive ? 'var(--theme-success)' : 'var(--theme-error)'
          }}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
}

export default StatCard;
