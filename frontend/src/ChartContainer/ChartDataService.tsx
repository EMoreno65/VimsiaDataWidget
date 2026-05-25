// I want all data from the CSV to be sent here and then have the necessart data for each chart type sent over as props

type PieChartData = {
    name: string;
    value: number;
}

export async function fetchPieChartData(): Promise<PieChartData[]> {
    const response = await fetch('http://localhost:4001/api/make-chart'); // This is where we would call the backend API to get the data for the pie chart. For now, it's just a placeholder endpoint
    if (!response.ok) {
        throw new Error(`Error fetching pie chart data: ${response.statusText}`);
    }
    const pieData = await response.json();
    return pieData; // This should return the data in the format that the PieChart component expects, which is an array of objects with 'name' and 'value' properties
}