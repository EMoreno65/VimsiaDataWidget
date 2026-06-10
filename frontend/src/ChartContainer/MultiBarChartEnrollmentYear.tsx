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


type MultiChartData = Record<string, Record<string, number>>;

type Props = {
  data: MultiChartData;
};

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

  const chartData = Object.entries(data).map( // This line takes the input data, which is a dictionary where keys are group names and values are dictionaries of subgroup names and their corresponding values, and converts it into an array of objects that Recharts can work with. Each object in the resulting array will have a 'group' property for the group name and additional properties for each subgroup with their corresponding values.
    ([groupName, subgroupDict]) => ({ // For each entry in the input data, we take the group name and the corresponding subgroup dictionary and create a new object. The 'group' property is set to the group name, and we spread the subgroup dictionary to include all subgroup names as properties with their corresponding values.

      group: groupName, // This line creates a new property called 'group' in the resulting object and assigns it the value of 'groupName', which is the key from the original dictionary. This 'group' property will be used as the x-axis label in the bar chart.

      ...subgroupDict // This line uses the spread operator to take all key-value pairs from the 'subgroupDict' and add them as properties to the resulting object. Each key in 'subgroupDict' represents a subgroup (e.g., "1st", "2nd", etc.), and its corresponding value is the count for that subgroup. By spreading 'subgroupDict', we ensure that each subgroup becomes a separate property in the resulting object, which allows Recharts to access these values when rendering the bars in the chart.
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