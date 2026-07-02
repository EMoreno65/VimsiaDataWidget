import React from 'react';
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer
} from 'recharts';

type Props = {
  data: Record<string, number>;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const PieChartFinaidComponent: React.FC<Props> = ({ data }) => {

  const chartData = Object.entries(data).map(([grade, value]) => ({
    grade,
    value,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="grade"
          outerRadius={100}
          label
        >
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartFinaidComponent;