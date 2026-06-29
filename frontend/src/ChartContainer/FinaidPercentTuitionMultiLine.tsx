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
  { key: 'Lower',    color: '#8884d8' },
  { key: 'Middle', color: '#82ca9d' },
  { key: 'Upper',      color: '#ff7300' },
];

const FinaidPercentTuitionMultiLineComponent: React.FC<Props> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />

        {LINES.map(({ key, color }) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={color}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default FinaidPercentTuitionMultiLineComponent;