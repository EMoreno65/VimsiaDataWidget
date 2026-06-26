// I want all data from the CSV to be sent here and then have the necessart data for each chart type sent over as props

// const API_URL = process.env.VITE_API_URL || 'https://vimsiadatawidget-production.up.railway.app';
const API_URL = 'http://localhost:4001';

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
    const response = await fetch(`${API_URL}/api/make-chart`); // This is where we would call the backend API to get the data for the pie chart. For now, it's just a placeholder endpoint
    if (!response.ok) {
        throw new Error(`Error fetching pie chart data: ${response.statusText}`);
    }
    const pieData = await response.json();
    return pieData; // This should return the data in the format that the PieChart component expects, which is an array of objects with 'name' and 'value' properties
}

export async function fetchEnrollmentMultiBarData(): Promise<MultiChartData> {
    const response = await fetch(`${API_URL}/api/make-enrollment-multi-bar`); // This is where we would call the backend API to get the data for the multi bar chart. For now, it's just a placeholder endpoint
    if (!response.ok) {
        throw new Error(`Error fetching multi bar chart data: ${response.statusText}`);
    }
    const multiBarData = await response.json();
    return multiBarData; // This should return the data in the format that the MultiBarChart component expects, which is a dictionary where keys are group names and values are dictionaries of subgroup names and their corresponding values
}

export async function fetchBarChartData(): Promise<BarChartData[]> {
    const response = await fetch(`${API_URL}/api/make-chart`);
    if (!response.ok) {
        throw new Error(`Error fetching bar chart data: ${response.statusText}`);
    }
    const barChartData = await response.json();
    return barChartData; // This should return the data in the format that the BarChart component expects, which is an array of objects with 'name' and 'value' properties
}

export async function fetchEnrollmentCapacityLineData(): Promise<LineGraphData[]> {
    const response = await fetch(`${API_URL}/api/make-enrollment-line-capacity`);
    if (!response.ok) {
        throw new Error(`Error fetching line graph data: ${response.statusText}`);
    }
    const lineGraphData = await response.json();
    return lineGraphData; // This should return the data in the format that the LineGraph component expects, which is an array of objects with 'name' and 'value' properties
}

export async function fetchEnrollmentDivisionLineData(): Promise<LineGraphData[]> {
    const response = await fetch(`${API_URL}/api/make-enrollment-line-division`);
    if (!response.ok) {
        throw new Error(`Error fetching line graph data: ${response.statusText}`);
    }
    const lineGraphData = await response.json();
    return lineGraphData; // This should return the data in the format that the LineGraph component expects, which is an array of objects with 'name' and 'value' properties
}

export async function fetchEnrollmentDivisionMultiBarData(): Promise<MultiChartData> {
    console.log("Does the enrollment division multi bar fetch get called?");
    const response = await fetch(`${API_URL}/api/make-multibar-enrollment-division`);
    if (!response.ok) {
        throw new Error(`Error fetching multi bar chart data: ${response.statusText}`);
    }
    const multiBarData = await response.json();
    
    return multiBarData; // This should return the data in the format that the MultiBarChart component expects, which is a dictionary where keys are group names and values are dictionaries of subgroup names and their corresponding values
}

export async function fetchFinaidBarData(): Promise<BarChartData[]> {
    const response = await fetch(`${API_URL}/api/make-finaid-single-bar`);
    if (!response.ok) {
        throw new Error(`Error fetching financial aid bar chart data: ${response.statusText}`);
    }
    const finaidBarData = await response.json();
    return finaidBarData; // This should return the data in the format that the BarChart component expects, which is an array of objects with 'name' and 'value' properties
}

export async function fetchFinaidMultiBarData(): Promise<MultiChartData> {
    const response = await fetch(`${API_URL}/api/make-finaid-multi-bar`);
    if (!response.ok) {
        throw new Error(`Error fetching multi bar finance data`);
    }
    const finaidMultiBarData = await response.json();
    return finaidMultiBarData;
}

export async function fetchTuitionGradeData(tuitionTerm: string): Promise<BarChartData[]> {
    const response = await fetch(`${API_URL}/api/make-tuition-grade-bar?term=${encodeURIComponent(tuitionTerm)}`);
    if (!response.ok) {
        throw new Error(`Error fetching tuition by grade data: ${response.statusText}`);
    }
    const tuitionGradeData = await response.json();
    console.log("Fetched tuition grade data:", tuitionGradeData);
    return tuitionGradeData; // This should return the data in the format that the BarChart component expects, which is an array of objects with 'name' and 'value' properties
}

export async function fetchHighestTuitionYearData(): Promise<BarChartData[]> {
    const response = await fetch(`${API_URL}/api/highest-tuition-year`);
    if (!response.ok) {
        throw new Error(`Error fetching highest tuition by year data: ${response.statusText}`);
    }
    const highestTuitionYearData = await response.json();
    return highestTuitionYearData; // This should return the data in the format that the BarChart component expects, which is an array of objects with 'name' and 'value' properties
}

export async function fetchTuitionIncreaseData(): Promise<BarChartData[]> {
    const response = await fetch(`${API_URL}/api/tuition-increase-by-year`);
    if (!response.ok) {
        throw new Error(`Error fetching tuition increase by year data: ${response.statusText}`);
    }
    const tuitionIncreaseData = await response.json();
    return tuitionIncreaseData; // This should return the data in the format that the BarChart component expects, which is an array of objects with 'name' and 'value' properties
}

export async function fetchFinaidIncreaseData(): Promise<BarChartData[]> {
    const response = await fetch(`${API_URL}/api/percentage-change-finance`);
    if (!response.ok) {
        throw new Error(`Error fetching finaid increase by year data: ${response.statusText}`);
    }
    const finaidIncreaseData = await response.json();
    return finaidIncreaseData;
}