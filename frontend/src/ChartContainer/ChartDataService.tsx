// I want all data from the CSV to be sent here and then have the necessart data for each chart type sent over as props

const API_URL = process.env.VITE_API_URL || 'https://vimsiadatawidget-production.up.railway.app';

type PieChartData = {
    name: string;
    value: number;
}

type MultiChartData = {
    [x: string]: Record<string, number>;
}

type BarChartData = {
    name: string;
    value: number;
}

type LineGraphData = {
    name: string;
    value: number;
}

export async function fetchPieChartData(): Promise<PieChartData[]> {
    const response = await fetch(`http://localhost:4001/api/make-chart`); // This is where we would call the backend API to get the data for the pie chart. For now, it's just a placeholder endpoint
    if (!response.ok) {
        throw new Error(`Error fetching pie chart data: ${response.statusText}`);
    }
    const pieData = await response.json();
    return pieData; // This should return the data in the format that the PieChart component expects, which is an array of objects with 'name' and 'value' properties
}

export async function fetchMultiBarChartData(): Promise<MultiChartData> {
    const response = await fetch(`http://localhost:4001/api/make-enrollment-multi-bar`); // This is where we would call the backend API to get the data for the multi bar chart. For now, it's just a placeholder endpoint
    if (!response.ok) {
        throw new Error(`Error fetching multi bar chart data: ${response.statusText}`);
    }
    const multiBarData = await response.json();
    return multiBarData; // This should return the data in the format that the MultiBarChart component expects, which is a dictionary where keys are group names and values are dictionaries of subgroup names and their corresponding values
}

export async function fetchBarChartData(): Promise<BarChartData[]> {
    const response = await fetch(`http://localhost:4001/api/make-chart`);
    if (!response.ok) {
        throw new Error(`Error fetching bar chart data: ${response.statusText}`);
    }
    const barChartData = await response.json();
    return barChartData; // This should return the data in the format that the BarChart component expects, which is an array of objects with 'name' and 'value' properties
}

export async function fetchLineGraphData(): Promise<LineGraphData[]> {
    const response = await fetch(`http://localhost:4001/api/make-enrollment-line-capacity`);
    if (!response.ok) {
        throw new Error(`Error fetching line graph data: ${response.statusText}`);
    }
    const lineGraphData = await response.json();
    return lineGraphData; // This should return the data in the format that the LineGraph component expects, which is an array of objects with 'name' and 'value' properties
}

