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
  applicationsToNewStudents: number;
  acceptanceRate: number;
  yield: number;
};

type Props = {
  data?: LineGraphData[] | null;
};

const LINES = [
  { key: 'applicationsToNewStudents', color: '#2563eb' },
  { key: 'acceptanceRate', color: '#0f766e' },
  { key: 'yield', color: '#f59e0b' },
];

const AdmissionTrendsComponent: React.FC<Props> = ({ data }) => {
  const chartData = Array.isArray(data) ? data : [];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
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

export default AdmissionTrendsComponent;