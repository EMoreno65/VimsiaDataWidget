import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { compareGradeLabels } from './sortUtils.ts';
import OrderedLegend from './OrderedLegend.tsx';

type ChartEntry = Record<string, string | number>;

type Props = {
  chartData: ChartEntry[];
  terms: string[];
};

const TERM_COLORS = ['#2563eb', '#0f766e', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2'];

const MultiBarChartEnrollmentDivisionComponent: React.FC<Props> = ({ chartData, terms }) => {
  const orderedTerms = [...terms].sort((a, b) => compareGradeLabels(String(a), String(b)));
  const orderedLegendItems = [
    ...orderedTerms.map((term, index) => ({
      value: term,
      color: TERM_COLORS[index % TERM_COLORS.length]
    })),
    {
      value: 'capacity',
      color: '#9ca3af'
    }
  ];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip />
        <Legend content={() => <OrderedLegend items={orderedLegendItems} />} />
        {orderedTerms.map((term, index) => (
          <Bar key={term} dataKey={term} fill={TERM_COLORS[index % TERM_COLORS.length]} radius={[4, 4, 0, 0]} />
        ))}
        <Bar key="capacity" dataKey="capacity" fill="#9ca3af" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MultiBarChartEnrollmentDivisionComponent;