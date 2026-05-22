import React, { useState, useEffect } from 'react';
import PieChartComponent from './ChartContainer/PieChart';
import { fetchPieChartData}  from './ChartContainer/ChartDataService'; // This is the function we created to fetch the data for the pie chart from the backend

interface ApiResponse {
  message: string;
}

const App: React.FC = () => {
  const [message, setMessage] = useState<string>('Loading...');
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [pieData, setPieData] = useState<any>(null); // State to hold the data for the pie chart, which we will fetch from the backend when the user clicks the button to generate the chart

  // useEffect means the action inside will run once when the component mounts
  // the component mounting means the first time it appears on the screen
  useEffect(() => {
    fetch('http://localhost:4000/api/hello') // Backend api is local for now
      .then((res) => res.json()) // Parse the response as JSON, which is the format our backend sends data in
      .then((data: ApiResponse) => setMessage(data.message)) // Set the message state to the message we got from the backend, which will cause the component to re-render and show the new message
      .catch((err) => setMessage(`Error: ${err.message}`)); // If there's an error (like the bacykend isn't running), set the message to show the error instead
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadStatus('Uploading...');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('http://localhost:4000/api/upload-csv', {
      method: 'POST',
      body: formData
    });

    const result = await res.json();
    if (res.ok) {
      setUploadStatus('Upload successful!');
    }
    else {
      setUploadStatus(`Upload failed: ${result.message}`);
    }
  }

  const handleGenerateChart = async () => {
    const result = await fetchPieChartData(); 
    if (result) {
      console.log('Chart data:', result);
      setPieData(result);
      // Here we would set the state for the chart data and render the PieChartComponent with that data as props
    }
    else {
      console.error('Failed to fetch chart data');
    }
  }

  return (
    <><div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Full Stack App</h1>
      <p>Message from backend: <strong>{message}</strong></p>
    </div><div>
        <label htmlFor="csvFileInput">Choose a CSV file to upload:</label>
        <input type="file" id="csvFileInput" accept=".csv" onChange={handleFileChange} />
      </div>
      <p>{uploadStatus}</p>
      <>
      <button type="button" onClick={handleGenerateChart}>Click here to generate a pie chart</button> 
      {pieData && <PieChartComponent data={pieData} />} {/* This is where we would render the PieChartComponent and pass the fetched data as props */}
      </>
    </>
  );
};

export default App;
