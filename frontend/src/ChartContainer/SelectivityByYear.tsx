import React from 'react';
import {
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  YAxis,
  XAxis,
  CartesianGrid
} from 'recharts';

type LineGraphData = {
  name: string;
  value: number;
};

type Props = {
  data?: LineGraphData[] | Record<string, number> | null;
};

const normalizeData = (input: Props['data']): LineGraphData[] => {
  if (Array.isArray(input)) {
    return input.map((item) => ({
      name: item.name ?? '',
      value: Number(item.value ?? 0),
    }));
  }

  if (input && typeof input === 'object') {
    return Object.entries(input).map(([name, value]) => ({
      name,
      value: typeof value === 'number' ? value : Number(value) || 0,
    }));
  }

  return [];
};

const SelectivityByYearComponent: React.FC<Props> = ({ data }) => {
  const chartData = normalizeData(data);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="name" />
        <YAxis />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="value"
          stroke="#8884d8"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SelectivityByYearComponent;