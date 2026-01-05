import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { OEVKCount } from '../services/analyticsService';

interface OEVKBarChartProps {
  data: OEVKCount[];
}

function OEVKBarChart({ data }: OEVKBarChartProps) {
  // Sort by count descending for better visualization
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="rounded-lg shadow p-6 border" style={{
      backgroundColor: 'var(--theme-card-bg)',
      borderColor: 'var(--theme-card-border)'
    }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--theme-text-primary)' }}>
        Önkéntesek OEVK szerinti megoszlása
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={sortedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border-secondary)" />
          <XAxis
            dataKey="oevk"
            stroke="var(--theme-text-tertiary)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="var(--theme-text-tertiary)"
            style={{ fontSize: '12px' }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--theme-card-bg)',
              border: '1px solid var(--theme-card-border)',
              borderRadius: '8px',
              fontSize: '14px',
              color: 'var(--theme-text-primary)'
            }}
            labelStyle={{ color: 'var(--theme-text-primary)', fontWeight: 'bold' }}
            formatter={(value: number) => [`${value} önkéntes`, 'Szám']}
          />
          <Bar
            dataKey="count"
            fill="var(--theme-btn-primary-bg)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default OEVKBarChart;
