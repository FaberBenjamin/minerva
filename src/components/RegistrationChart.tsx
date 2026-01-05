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
    <div className="rounded-lg shadow p-6 border" style={{
      backgroundColor: 'var(--theme-card-bg)',
      borderColor: 'var(--theme-card-border)'
    }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--theme-text-primary)' }}>
        Regisztrációk (utolsó 30 nap)
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-border-secondary)" />
          <XAxis
            dataKey="dateLabel"
            stroke="var(--theme-text-tertiary)"
            style={{ fontSize: '12px' }}
            interval="preserveStartEnd"
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
            formatter={(value: number) => [`${value} regisztráció`, 'Szám']}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="var(--theme-btn-primary-bg)"
            strokeWidth={2}
            dot={{ fill: 'var(--theme-btn-primary-bg)', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RegistrationChart;
