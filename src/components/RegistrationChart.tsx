import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DailyRegistration } from '../services/analyticsService';
import { formatChartDate } from '../services/analyticsService';

interface RegistrationChartProps {
  data: DailyRegistration[];
}

function RegistrationChart({ data }: RegistrationChartProps) {
  // Format data for chart
  const chartData = data.map((item) => ({
    ...item,
    dateLabel: formatChartDate(item.date),
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-minerva-gray-200">
      <h3 className="text-lg font-semibold text-minerva-gray-900 mb-4">
        Regisztrációk (utolsó 30 nap)
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="dateLabel"
            stroke="#6b6b6b"
            style={{ fontSize: '12px' }}
            interval="preserveStartEnd"
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
            formatter={(value: number) => [`${value} regisztráció`, 'Szám']}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#2d2d2d"
            strokeWidth={2}
            dot={{ fill: '#2d2d2d', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RegistrationChart;
