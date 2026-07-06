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
  { key: 'applicationsToNewStudents', color: '#8884d8' },
  { key: 'acceptanceRate', color: '#82ca9d' },
  { key: 'yield', color: '#ff7300' },
];

const AdmissionTrendsComponent: React.FC<Props> = ({ data }) => {
  const chartData = Array.isArray(data) ? data : [];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
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

export default AdmissionTrendsComponent;