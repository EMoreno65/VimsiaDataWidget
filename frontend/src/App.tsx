import React, { useState, useEffect } from 'react';
import PieChartComponent from './ChartContainer/PieChart.tsx';
import MultiBarChartEnrollmentYearComponent from './ChartContainer/MultiBarChartEnrollmentYear.tsx';
import BarChartComponent from './ChartContainer/BarChart.tsx';
import LineGraphComponent from './ChartContainer/LineGraph.tsx';
import { fetchPieChartData, fetchEnrollmentMultiBarData, fetchBarChartData, fetchEnrollmentCapacityLineData, fetchEnrollmentDivisionLineData, fetchEnrollmentDivisionMultiBarData } from './ChartContainer/ChartDataService.tsx';
import MultiLineGraphComponent from './ChartContainer/MultiLineGraph.tsx';
import MultiBarChartEnrollmentDivisionComponent from './ChartContainer/MultiBarChartEnrollmentDivision.tsx';

// const API_URL = process.env.REACT_APP_API_URL;
const API_URL = 'http://localhost:4001';
// console.log('API_URL:', process.env.REACT_APP_API_URL);

// Note: I'd like to have an api for every individual chart. For example. the enrollment multi-bar will be its own api.

interface ApiResponse {
  message: string;
}

const App: React.FC = () => {
  const [message, setMessage] = useState<string>('Loading...');
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [pieData, setPieData] = useState<any>(null);
  const [enrollmentMultiBarData, setEnrollmentMultiBarData] = useState<any>(null);
  const [enrollmentDivisionMultiBarData, setEnrollmentDivisionMultiBarData] = useState<any>(null);
  const [barChartData, setBarChartData] = useState<any>(null);
  const [enrollmentCapacityLineData, setEnrollmentCapacityLineData] = useState<any>(null);
  const [enrollmentDivisionLineData, setEnrollmentDivisionLineData] = useState<any>(null);

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
      const res = await fetch(`${API_URL}/api/upload-enrollment-csv`, {
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

  const handleFileChangeTest = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadStatus('Uploading...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/api/upload-finance-csv`, {
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

  const handleGenerateEnrollmentMultiBarChart = async () => {
    try {
      const result = await fetchEnrollmentMultiBarData();
      if (result) {
        console.log('Multi-bar chart data:', result);
        setEnrollmentMultiBarData(result);
      } else {
        console.error('Failed to fetch multi-bar chart data');
      }
    } catch (err) {
      console.error('Error fetching multi-bar chart data:', err);
    }
  };

  const handleGenerateBarChart = async () => {
    try {
      const result = await fetchBarChartData();
      if (result) {
        console.log('Bar chart data:', result);
        setBarChartData(result);
      } else {
        console.error('Failed to fetch bar chart data');
      }
    } catch (err) {
      console.error('Error fetching bar chart data:', err);
    }
  };

  const handleGenerateEnrollmentCapacityLineData = async () => {
    try {
      const result = await fetchEnrollmentCapacityLineData();
      if (result) {
        console.log('Line graph data:', result);
        setEnrollmentCapacityLineData(result);
      } else {
        console.error('Failed to fetch line graph data');
      }
    } catch (err) {
      console.error('Error fetching line graph data:', err);
    }
  };

  const handleGenerateEnrollmentDivisionLineData = async () => {
    try {
      const result = await fetchEnrollmentDivisionLineData();
      if (result) {
        console.log('Line graph data:', result);
        setEnrollmentDivisionLineData(result);
      } else {
        console.error('Failed to fetch line graph data');
      }
    } catch (err) {
      console.error('Error fetching line graph data:', err);
    }
  };

  const handleGenerateEnrollmentDivisionMultiBarData = async () => {
    try {
      const result = await fetchEnrollmentDivisionMultiBarData();
      console.log("What's the returned result: ", result);
      if (result) {
        console.log('Multi-bar chart data:', result);
        setEnrollmentDivisionMultiBarData(result);
      } else {
        console.error('Failed to fetch multi-bar chart data');
      }
    } catch (err) {
      console.error('Error fetching multi-bar chart data:', err);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', Arial, sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '0.5px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: '#185FA5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#E6F1FB', fontSize: 16 }}>◉</span>
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.3px' }}>Vimsia</div>
            <div style={{ fontSize: 12, color: '#888', fontFamily: 'monospace' }}>analytics dashboard</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#16a34a', background: '#f0fdf4', padding: '5px 10px', borderRadius: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
          {message}
        </div>
      </div>

      {/* Upload bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1.5rem', background: '#f9fafb', borderBottom: '0.5px solid #e5e7eb' }}>
        <span style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>Data source</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, padding: '6px 12px', borderRadius: 8, border: '0.5px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>
          <input type="file" accept=".csv" onChange={handleFileChange} style={{ display: 'none' }} />
          ↑ Choose CSV file
        </label>
        {uploadStatus && <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{uploadStatus}</span>}
      </div>

      {/* Upload bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1.5rem', background: '#f9fafb', borderBottom: '0.5px solid #e5e7eb' }}>
        <span style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>Data source</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, padding: '6px 12px', borderRadius: 8, border: '0.5px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>
          <input type="file" accept=".csv" onChange={handleFileChangeTest} style={{ display: 'none' }} />
          ↑ Choose CSV file THIS ONES FOR TESTING
        </label>
        {uploadStatus && <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{uploadStatus}</span>}
      </div>

      {/* Chart cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, padding: '1.25rem 1.5rem' }}>
        {[
          { label: 'Distribution', title: 'Pie Chart', desc: 'Proportional breakdown across categories.', accent: '#185FA5', bg: '#E6F1FB', onClick: handleGeneratePieChart, chart: pieData && <PieChartComponent data={pieData} /> },
          { label: 'Enrollment · Year', title: 'Multi-bar chart by year', desc: 'Compare enrollment figures across academic years.', accent: '#0F6E56', bg: '#E1F5EE', onClick: handleGenerateEnrollmentMultiBarChart, chart: enrollmentMultiBarData && <MultiBarChartEnrollmentYearComponent data={enrollmentMultiBarData} /> },
          { label: 'Enrollment · Division', title: 'Line graph', desc: 'Enrollment trends per division over time.', accent: '#854F0B', bg: '#FAEEDA', onClick: handleGenerateEnrollmentDivisionLineData, chart: enrollmentDivisionLineData && <MultiLineGraphComponent data={enrollmentDivisionLineData} /> },
          { label: 'Enrollment · Division', title: 'Multi-bar chart', desc: 'Side-by-side comparison across divisions and terms.', accent: '#993C1D', bg: '#FAECE7', onClick: handleGenerateEnrollmentDivisionMultiBarData, chart: enrollmentDivisionMultiBarData && <MultiBarChartEnrollmentDivisionComponent chartData={enrollmentDivisionMultiBarData.chartData} terms={enrollmentDivisionMultiBarData.terms} /> },
          { label: 'General', title: 'Bar chart', desc: 'Categorical comparison across your dataset.', accent: '#534AB7', bg: '#EEEDFE', onClick: handleGenerateBarChart, chart: barChartData && <BarChartComponent data={barChartData} /> },
          { label: 'Capacity · Enrollment', title: 'Enrollment vs capacity', desc: 'Overlay enrollment against capacity limits.', accent: '#3B6D11', bg: '#EAF3DE', onClick: handleGenerateEnrollmentCapacityLineData, chart: enrollmentCapacityLineData && <LineGraphComponent data={enrollmentCapacityLineData} /> },
        ].map(({ label, title, desc, accent, bg, onClick, chart }) => (
          <div key={title} style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#9ca3af', fontFamily: 'monospace', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{title}</div>
              </div>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, flexShrink: 0 }}>◈</div>
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>{desc}</div>
            <button type="button" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 'auto', fontSize: 13, fontWeight: 500, padding: '7px 14px', borderRadius: 8, border: '0.5px solid #d1d5db', background: '#fff', cursor: 'pointer', width: 'fit-content' }}>
              ▶ Generate
            </button>
            {chart}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
