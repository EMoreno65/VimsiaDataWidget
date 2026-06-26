import React, { useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

type ChartEntry = Record<string, string | number>;

type Props = {
  chartData: ChartEntry[];
};

const TERM_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff8042',
  '#0088fe',
  '#00C49F',
];

const MultiBarAidByGradeYear: React.FC<Props> = ({ chartData }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  // Extract unique term names from the data dynamically
  const termNames: string[] = [];
  if (chartData && chartData.length > 0) {
    Object.keys(chartData[0]).forEach(key => {
      if (key !== 'name' && typeof chartData[0][key] === 'number') {
        termNames.push(key);
      }
    });
  }

  const downloadChart = async () => {
    console.log("I'm in the multi-bar component, I need to diagnose the problem");
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
          <XAxis dataKey="name" />  {/* grades across the bottom */}
          <YAxis />
          <Tooltip />
          <Legend />

            {termNames.map((term, index) => (
              <Bar key={term} dataKey={term} fill={TERM_COLORS[index % TERM_COLORS.length]} />
            ))}

        </BarChart>
      </ResponsiveContainer>
      <button onClick={downloadChart}>Download Chart</button>
    </div>
  );
};

export default MultiBarAidByGradeYear;