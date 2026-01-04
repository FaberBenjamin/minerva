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
    <div className="bg-white rounded-lg shadow p-6 border border-minerva-gray-200">
      <h3 className="text-lg font-semibold text-minerva-gray-900 mb-4">
        Önkéntesek OEVK szerinti megoszlása
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={sortedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="oevk"
            stroke="#6b6b6b"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b6b6b"
            style={{ fontSize: '12px' }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
            }}
            labelStyle={{ color: '#2d2d2d', fontWeight: 'bold' }}
            formatter={(value: number) => [`${value} önkéntes`, 'Szám']}
          />
          <Bar
            dataKey="count"
            fill="#2d2d2d"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default OEVKBarChart;
