import React, { useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type ChartEntry = Record<string, string | number>; // { name: division, [term]: count }

type Props = {
  chartData: ChartEntry[];
  terms: string[];
};

const TERM_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff8042',
  '#0088fe',
  '#00C49F',
];

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

  return (
    <div ref={chartRef}>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />  {/* divisions across the bottom */}
          <YAxis />
          <Tooltip />
          <Legend />

            <Bar dataKey="2021-2022 School Year" fill={TERM_COLORS[0]} />
            <Bar dataKey="2022-2023 School Year" fill={TERM_COLORS[1]} />
            <Bar dataKey="2023-2024 School Year" fill={TERM_COLORS[2]} />
            <Bar dataKey="2024-2025 School Year" fill={TERM_COLORS[3]} />

        </BarChart>
      </ResponsiveContainer>
      <button onClick={downloadChart}>Download Chart</button>
    </div>
  );
};

export default MultiBarChartEnrollmentDivisionComponent;