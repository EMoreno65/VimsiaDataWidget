import React from 'react';
import {
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  YAxis,
  XAxis,
  CartesianGrid,
  Legend
} from 'recharts';

type LineGraphData = {
  name: string;
  Lower: number;
  Middle: number;
  Upper: number;
};

type Props = {
  data: LineGraphData[];
};

const LINES = [
  { key: 'Lower', color: '#2563eb' },
  { key: 'Middle', color: '#0f766e' },
  { key: 'Upper', color: '#f59e0b' },
];

const FinaidPercentTuitionMultiLineComponent: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip />
        <Legend />

        {LINES.map(({ key, color }) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={color}
            strokeWidth={2.5}
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default FinaidPercentTuitionMultiLineComponent;