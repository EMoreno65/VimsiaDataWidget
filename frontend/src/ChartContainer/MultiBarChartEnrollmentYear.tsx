import React from 'react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import { useRef } from "react";
import * as htmlToImage from "html-to-image";


type MultiChartData = Record<string, Record<string, number>>;

type Props = {
  data: MultiChartData;
};

const COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff8042'
];

  const gradeColors: Record<string, string> = {
    "1st": "#6366f1",
    "2nd": "#22c55e",
    "3rd": "#f59e0b",
    "4th": "#ef4444",
    "5th": "#06b6d4",
    "6th": "#a855f7",
    "7th": "#14b8a6",
    "8th": "#f97316",
    "9th": "#3b82f6",
    "10th": "#84cc16",
    "11th": "#e879f9",
    "12th": "#fb7185"
  };



const MultiBarChartEnrollmentYearComponent: React.FC<Props> = ({
  data
}) => {

  const gradeOrder = [
    "1st",
    "2nd",
    "3rd",
    "4th",
    "5th",
    "6th",
    "7th",
    "8th",
    "9th",
    "10th",
    "11th",
    "12th"
  ];
  const chartRef = useRef<HTMLDivElement>(null);

  const downloadChart = async () => {
    if (!chartRef.current) return;

    const htmlToImage = await import("html-to-image");
    const dataUrl = await htmlToImage.toPng(chartRef.current);

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "chart.png";
    link.click();
  };

  const legendPayload = gradeOrder.map((grade) => ({
    value: grade,
    type: "square",
    color: gradeColors[grade]
  }));

  // STEP 1:
  // Convert dictionary -> array for Recharts

  const chartData = Object.entries(data).map(
    ([groupName, subgroupDict]) => ({

      group: groupName,

      ...subgroupDict
    })
  );

  // STEP 2:
  // Get all subgroup names dynamically

  const subgroupNames = new Set<string>();

  Object.values(data).forEach((subgroupDict) => {

    Object.keys(subgroupDict).forEach((subgroup) => {

      subgroupNames.add(subgroup);

    });

  });

  return (

    <div ref={chartRef}>
      <ResponsiveContainer width="100%" height={400}>

        <BarChart data={chartData}>

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="termName" />
          <YAxis />

          <Tooltip />
          <Legend payload={legendPayload as any} sort="none" />

          <Bar dataKey="1st" fill={gradeColors["1st"]} />
          <Bar dataKey="2nd" fill={gradeColors["2nd"]} />
          <Bar dataKey="3rd" fill={gradeColors["3rd"]} />
          <Bar dataKey="4th" fill={gradeColors["4th"]} />
          <Bar dataKey="5th" fill={gradeColors["5th"]} />
          <Bar dataKey="6th" fill={gradeColors["6th"]} />
          <Bar dataKey="7th" fill={gradeColors["7th"]} />
          <Bar dataKey="8th" fill={gradeColors["8th"]} />
          <Bar dataKey="9th" fill={gradeColors["9th"]} />
          <Bar dataKey="10th" fill={gradeColors["10th"]} />
          <Bar dataKey="11th" fill={gradeColors["11th"]} />
          <Bar dataKey="12th" fill={gradeColors["12th"]} />

        </BarChart>

      </ResponsiveContainer>
      <button onClick={downloadChart}>
        Download Chart
      </button>
    </div>
  );
};

export default MultiBarChartEnrollmentYearComponent;