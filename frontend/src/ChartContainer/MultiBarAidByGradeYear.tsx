import React, { useRef } from 'react';
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
  const chartRef = useRef<HTMLDivElement>(null);

  const termNames: string[] = [];
  if (chartData && chartData.length > 0) {
    Object.keys(chartData[0]).forEach((key) => {
      if (key !== 'name' && typeof chartData[0][key] === 'number') {
        termNames.push(key);
      }
    });
  }

  const downloadChart = async () => {
    if (!chartRef.current) return;
    const htmlToImage = await import('html-to-image');
    const dataUrl = await htmlToImage.toPng(chartRef.current);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'chart.png';
    link.click();
  };

  const orderedChartData = [...chartData].sort((a, b) => String(a.name).localeCompare(String(b.name)));

  return (
    <div ref={chartRef}>
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
      <button onClick={downloadChart} style={{ marginTop: 8, border: '1px solid #d1d5db', borderRadius: 8, padding: '6px 12px', background: '#fff', cursor: 'pointer' }}>
        Download Chart
      </button>
    </div>
  );
};

export default MultiBarAidByGradeYear;