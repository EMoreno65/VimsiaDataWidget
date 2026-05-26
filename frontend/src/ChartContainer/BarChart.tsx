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

type BarChartData = {
    name: string;
    value: number;
};

type Props = {
  data: BarChartData[];
};

const COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff8042'
];

const BarChartComponent: React.FC<Props> = ({
  data
}) => {
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

    <ResponsiveContainer width="100%" height={400}>

      <BarChart data={chartData}>

        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="group" />

        <YAxis />

        <Tooltip />

        <Legend />

        {[...subgroupNames].map((subgroup, index) => (

          <Bar
            key={subgroup}
            dataKey={subgroup}
            fill={COLORS[index % COLORS.length]}
          />

        ))}

      </BarChart>

    </ResponsiveContainer>
  );
};

export default BarChartComponent;