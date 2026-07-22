import React, { useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type ChartEntry = Record<string, string | number>;

type Props = {
  chartData: ChartEntry[];
  terms: string[];
};

const TERM_COLORS = ['#2563eb', '#0f766e', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2'];

const MultiBarChartEnrollmentDivisionComponent: React.FC<Props> = ({ chartData, terms }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const downloadChart = async () => {
    if (!chartRef.current) return;
    const htmlToImage = await import('html-to-image');
    const dataUrl = await htmlToImage.toPng(chartRef.current);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'chart.png';
    link.click();
  };

  const orderedTerms = [...terms].sort((a, b) => String(a).localeCompare(String(b)));

  return (
    <div ref={chartRef}>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Legend />
          {orderedTerms.map((term, index) => (
            <Bar key={term} dataKey={term} fill={TERM_COLORS[index % TERM_COLORS.length]} radius={[4, 4, 0, 0]} />
          ))}
          <Bar key="capacity" dataKey="capacity" fill="#9ca3af" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <button onClick={downloadChart} style={{ marginTop: 8, border: '1px solid #d1d5db', borderRadius: 8, padding: '6px 12px', background: '#fff', cursor: 'pointer' }}>
        Download Chart
      </button>
    </div>
  );
};

export default MultiBarChartEnrollmentDivisionComponent;