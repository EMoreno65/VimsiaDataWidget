import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type Props = {
  data: Record<string, number>;
};

const AttritionProportionComponent: React.FC<Props> = ({ data }) => {
  const chartData = Object.entries(data).map(([grade, value]) => ({
    grade,
    value,
  }));

  const formatTooltipValue = (value: number | string) => {
    const numericValue = typeof value === 'number' ? value : Number(value);
    return `$${numericValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="grade" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip formatter={(value) => formatTooltipValue(value as number | string)} />
        <Legend />
        <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AttritionProportionComponent;