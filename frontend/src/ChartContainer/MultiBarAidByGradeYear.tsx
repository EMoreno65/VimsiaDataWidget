import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type ChartEntry = Record<string, string | number>;

type Props = {
  chartData: ChartEntry[];
};

const TERM_COLORS = ['#2563eb', '#0f766e', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2'];

const MultiBarAidByGradeYear: React.FC<Props> = ({ chartData }) => {
  const termNames: string[] = [];
  if (chartData && chartData.length > 0) {
    Object.keys(chartData[0]).forEach((key) => {
      if (key !== 'name' && typeof chartData[0][key] === 'number') {
        termNames.push(key);
      }
    });
  }

  const orderedChartData = [...chartData].sort((a, b) => String(a.name).localeCompare(String(b.name)));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={orderedChartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip />
        <Legend />
        {termNames.map((term, index) => (
          <Bar key={term} dataKey={term} fill={TERM_COLORS[index % TERM_COLORS.length]} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MultiBarAidByGradeYear;