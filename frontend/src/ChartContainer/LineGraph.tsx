import React from 'react';
import {
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  YAxis,
  XAxis,
  CartesianGrid,
  Bar,
  ComposedChart
} from 'recharts';

type LineGraphData = {
  name: string;
  value: number;
  capacity?: number;
};

type Props = {
  data: LineGraphData[];
};

const LineGraphComponent: React.FC<Props> = ({ data }) => {
  const hasCapacity = data.some((item) => typeof item.capacity === 'number');

  const formatTooltipValue = (value: number | string | undefined) => {
    const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
    return [`${numericValue.toFixed(2)}`, 'Value'];
  };

  const chartContent = (
    <>
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="name" tickLine={false} axisLine={false} />
      <YAxis tickLine={false} axisLine={false} />
      <Tooltip formatter={(value) => formatTooltipValue(value as number | string | undefined)} />
      {hasCapacity ? (
        <>
          <Bar dataKey="capacity" fill="#9ca3af" radius={[4, 4, 0, 0]} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </>
      ) : (
        <Line
          type="monotone"
          dataKey="value"
          stroke="#2563eb"
          strokeWidth={2.5}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      )}
    </>
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      {hasCapacity ? (
        <ComposedChart data={data}>{chartContent}</ComposedChart>
      ) : (
        <LineChart data={data}>{chartContent}</LineChart>
      )}
    </ResponsiveContainer>
  );
};

export default LineGraphComponent;