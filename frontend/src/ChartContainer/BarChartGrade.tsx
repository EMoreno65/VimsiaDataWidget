import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type Props = {
  data: Record<string, number>;
};

const formatValue = (value: number) => `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const BarChartGradeComponent: React.FC<Props> = ({ data }) => {
  const chartData = Object.entries(data)
    .map(([grade, value]) => ({
      grade,
      value,
    }))
    .sort((a, b) => String(a.grade).localeCompare(String(b.grade)));

  const formatTooltipValue = (value: number | string | undefined) => {
    const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
    return [formatValue(numericValue), 'Value'];
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="grade" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={formatValue} />
        <Tooltip formatter={(value) => formatTooltipValue(value as number | string | undefined)} />
        <Legend />
        <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartGradeComponent;