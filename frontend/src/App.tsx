import React, { useState, useEffect } from 'react';
import PieChartComponent from './ChartContainer/PieChart.tsx';
import { fetchPieChartData } from './ChartContainer/ChartDataService.tsx';

const API_URL = process.env.VITE_API_URL || 'https://vimsiadatawidget-production.up.railway.app';

interface ApiResponse {
  message: string;
}

const App: React.FC = () => {
  const [message, setMessage] = useState<string>('Loading...');
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [pieData, setPieData] = useState<any>(null);
  const [multiBarData, setMultiBarData] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/hello`)
      .then((res) => res.json())
      .then((data: ApiResponse) => setMessage(data.message))
      .catch((err) => setMessage(`Error: ${err.message}`));
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadStatus('Uploading...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/api/upload-csv`, {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      if (res.ok) {
        setUploadStatus('Upload successful!');
      } else {
        setUploadStatus(`Upload failed: ${result.message}`);
      }
    } catch (err) {
      setUploadStatus('Upload failed: could not reach server');
    }
  };

  const handleGeneratePieChart = async () => {
    try {
      const result = await fetchPieChartData();
      if (result) {
        console.log('Pie chart data:', result);
        setPieData(result);
      } else {
        console.error('Failed to fetch pie chart data');
      }
    } catch (err) {
      console.error('Error fetching pie chart data:', err);
    }
  };

  const handleGenerateMultiBarChart = async () => {
    try {
      const result = await fetchPieChartData();
      if (result) {
        console.log('Multi-bar chart data:', result);
        setMultiBarData(result);
      } else {
        console.error('Failed to fetch multi-bar chart data');
      }
    } catch (err) {
      console.error('Error fetching multi-bar chart data:', err);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Vimsia Dashboard</h1>
      <p>Backend status: <strong>{message}</strong></p>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="csvFileInput">Upload a CSV file: </label>
        <input
          type="file"
          id="csvFileInput"
          accept=".csv"
          onChange={handleFileChange}
        />
        {uploadStatus && <p>{uploadStatus}</p>}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button type="button" onClick={handleGeneratePieChart}>
          Generate pie chart
        </button>
        {pieData && <PieChartComponent data={pieData} />}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button type="button" onClick={handleGenerateMultiBarChart}>
          Generate multi-bar chart
        </button>
        {multiBarData && <PieChartComponent data={multiBarData} />}
      </div>
    </div>
  );
};

export default App;
