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
  Casa: number;
  Primary: number;
  LE: number;
  UE: number;
};

type Props = {
  data: LineGraphData[];
};

const LINES = [
  { key: 'Casa',    color: '#8884d8' },
  { key: 'Primary', color: '#82ca9d' },
  { key: 'LE',      color: '#ff7300' },
  { key: 'UE',      color: '#0088fe' },
];

const MultiLineGraphComponent: React.FC<Props> = ({ data }) => {
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

export default MultiLineGraphComponent;