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

const ApplicationNewStudentComponent: React.FC<Props> = ({ data }) => {
  const chartData = normalizeData(data);
  const formatTooltipValue = (value: number | string | undefined) => {
    const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
    return [numericValue.toLocaleString(undefined, { maximumFractionDigits: 2 }), 'Value'];
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip formatter={(value) => formatTooltipValue(value as number | string | undefined)} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#2563eb"
          strokeWidth={2.5}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ApplicationNewStudentComponent;