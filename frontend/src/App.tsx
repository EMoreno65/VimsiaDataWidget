import React, { useState, useEffect, useRef } from 'react';
import MultiBarChartEnrollmentYearComponent from './ChartContainer/MultiBarChartEnrollmentYear.tsx';
import BarChartComponent from './ChartContainer/BarChart.tsx';
import LineGraphComponent from './ChartContainer/LineGraph.tsx';
import { fetchApplicationNewStudentData, fetchAidRemissionPercent, fetchTuitionRemissionTerm, fetchFinaidRewardsSize, fetchFinaidRewardsGrade, fetchFinaidPercentRevenue, fetchFinaidIncreaseData, fetchTuitionIncreaseData, fetchTuitionGradeData, fetchEnrollmentMultiBarData, fetchEnrollmentCapacityLineData, fetchEnrollmentDivisionLineData, fetchEnrollmentDivisionMultiBarData, fetchFinaidBarData, fetchHighestTuitionYearData, fetchFinaidMultiBarData, fetchFinaidPercentRevenueDivision, fetchFinaidPercentRevenueGrade, fetchRemissionToTuition, fetchApplicationData, fetchSelectivityByYearData, fetchYieldByYearData, fetchAllAdmissionData, fetchAttritionProportionData, fetchAttritionDivisionProportionData } from './ChartContainer/ChartDataService.tsx';
import MultiLineGraphComponent from './ChartContainer/MultiLineGraph.tsx';
import MultiBarChartEnrollmentDivisionComponent from './ChartContainer/MultiBarChartEnrollmentDivision.tsx';
import MultiBarAidByGradeYear from './ChartContainer/MultiBarAidByGradeYear.tsx';
import MultiBarFinaidPercent from './ChartContainer/MultiBarFinaidPercent.tsx';
import FinaidPercentTuitionMultiLineComponent from './ChartContainer/FinaidPercentTuitionMultiLine.tsx';
import BarChartGradeComponent from './ChartContainer/BarChartGrade.tsx';
import BarChartFinaidGradeComponent from './ChartContainer/BarChartFinaidGrade.tsx';
import PieChartFinaidComponent from './ChartContainer/PieChartFinaid.tsx';
import BarChartRemissionComponent from './ChartContainer/BarChartRemission.tsx';
import RemissionGrossTuitionComponent from './ChartContainer/RemissionGrossTuition.tsx';
import AllAidTuitionComponent from './ChartContainer/AllAidTuition.tsx';
import BarChartApplicationComponent from './ChartContainer/BarChartApplication.tsx';
import ApplicationNewStudentComponent from './ChartContainer/ApplicationNewStudent.tsx';
import SelectivityByYearComponent from './ChartContainer/SelectivityByYear.tsx';
import YieldByYearComponent from './ChartContainer/YieldByYear.tsx';
import AdmissionTrendsComponent from './ChartContainer/AdmissionTrends.tsx';
import AttritionProportionComponent from './ChartContainer/AttritionProportion.tsx';


const API_URL = process.env.REACT_APP_API_URL;
// console.log('API_URL:', process.env.REACT_APP_API_URL);

// Note: I'd like to have an api for every individual chart. For example. the enrollment multi-bar will be its own api.

interface ApiResponse {
  message: string;
}

const App: React.FC = () => {
  const [message, setMessage] = useState<string>('Loading...');
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [tuitionTerm, setTuitionTerm] = useState<string>('2025-2026');
  const [enrollmentMultiBarData, setEnrollmentMultiBarData] = useState<any>(null);
  const [enrollmentDivisionMultiBarData, setEnrollmentDivisionMultiBarData] = useState<any>(null);
  const [enrollmentCapacityLineData, setEnrollmentCapacityLineData] = useState<any>(null);
  const [enrollmentDivisionLineData, setEnrollmentDivisionLineData] = useState<any>(null);
  const [finaidBarData, setFinaidBarData] = useState<any>(null);
  const [finAidMultiBarData, setFinaidMultiBarData] = useState<any>(null);
  const [tuitionGradeData, setTuitionGradeData] = useState<any>(null);
  const [highestTuitionYearData, setHighestTuitionYearData] = useState<any>(null);
  const [tuitionIncreaseData, setTuitionIncreaseData] = useState<any>(null);
  const [financialAidTerm, setFinancialAidTerm] = useState<any>(null);
  const [finaidPercentIncrease, setFinaidPercentIncrease] = useState<any>(null);
  const [finaidPercentRevenue, setFinaidPercentRevenue] = useState<any>(null);
  const [finaidPercentRevenueDivision, setFinaidPercentRevenueDivision] = useState<any>(null);
  const [finaidPercentRevenueGrade, setFinaidPercentRevenueGrade] = useState<any>(null);
  const [fourPointSixTerm, setFourPointSixTerm] = useState<any>(null);
  const [fourPointSevenTerm, setFourPointSevenTerm] = useState<any>(null);
  const [fourPointEightTerm, setFourPointEightTerm] = useState<any>(null);
  const [finaidRewardsGrade, setFinaidRewardsGrade] = useState<any>(null);
  const [finaidRewardsSize, setFinaidRewardsSize] = useState<any>(null);
  const [remissionData, setRemissionData] = useState<any>(null);
  const [remissionGrossTuitionData, setRemissionGrossTuitionData] = useState<any>(null);
  const [allAidTuitionData, setAllAidTuitionData] = useState<any>(null);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [applicationNewStudentData, setApplicationNewStudentData] = useState<any>(null);
  const [selectivityByYearData, setSelectivityByYearData] = useState<any>(null);
  const [yieldByYearData, setYieldByYearData] = useState<any>(null);
  const [allAdmissionData, setAllAdmissionData] = useState<any>(null);
  const [attritionProportionData, setAttritionProportionData] = useState<any>(null);
  const [attritionDivisionProportionData, setAttritionDivisionProportionData] = useState<any>(null);
  const chartDownloadRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const instructionsPlaceholder = [
    'Enrollment CSV: FACTS Staff Portal -> Finance -> Go to the Reports Tab -> Locate Custom Reports -> Select "Enrollment CSV Report Structure" -> Select the needed terms -> Select Print/View Options -> Export Data to Excel (Unformatted) -> Open File -> Save As CSV -> Upload CSV to this dashboard.',
    'Attrition CSV: SIS FACTS Portal -> Select 3 Bars in Top Left Corner -> Click "Admissions" -> Select Reports on the Upper Tab -> Select "Enrollment Dashboard" -> Choose the Year you would like attrition data for -> Select Export, then export.csv -> Upload the file to Attrition',
    'Financial Aid: First Select the Year you would like to upload financial data for -> Navigate to FACTS Staff Portal -> Finance -> Reports Tab -> "Select Balances with Adjustment Detail (as-of date)" -> Select the Student bubble instead of Customer -> Select the preferred year, then the Export to CSV Button -> Upload the File into the Finance Button',
    'Admissions: Navigate to the SIS Facts Portal -> Select 3 Bars in Top Left Corner -> Click "Admissions" -> Under Dashboard, there is a multi colored chart with a year shown on the left. Please screenshot this whole page (Including the year). Ideally use snipping tool or anything that produces a PNG -> Upload Screenshot to Admissions Tab',
    'Tuition and Fees: Navigate to the FACTS Staff Portal -> Select Profile from the top tab -> Select "Rate Tables" on the left menu -> Specify the preferred year from the drop down -> Select the tuition or fees hyperlink. You will see a chart of grades and money amounts. Please screenshot with a png and upload it to the respective Tuition or Fees tab on the dashboard. Note: Tuition and Fees will be added together when making the chart. Upload as many fees as is needed.'
  ];

  const sanitizeFileName = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'chart';

  const formatInstruction = (instruction: string) => {
    const [section, detail] = instruction.split(':');
    const title = section?.trim() || 'Instructions';
    const steps = (detail || instruction)
      .split('->')
      .map((step) => step.trim())
      .filter(Boolean);

    return { title, steps };
  };

  const getInstructionHighlights = (title: string) => {
    const normalized = title.toLowerCase();

    if (normalized.includes('financial aid')) {
      return ['Select the year first', 'Upload a .csv file'];
    }

    if (normalized.includes('admissions')) {
      return ['Upload a .png screenshot', 'Make sure the year is visible'];
    }

    if (normalized.includes('tuition and fees')) {
      return ['Select the year first', 'Upload tuition and all needed fee screenshots'];
    }

    return [];
  };

  const handleDownloadChart = async (chartKey: string, title: string) => {
    const chartNode = chartDownloadRefs.current[chartKey];
    if (!chartNode) return;

    const htmlToImage = await import('html-to-image');
    const dataUrl = await htmlToImage.toPng(chartNode, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#ffffff'
    });

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${sanitizeFileName(title)}.png`;
    link.click();
  };

  useEffect(() => {
    fetch(`${API_URL}/api/hello`)
      .then((res) => res.json())
      .then((data: ApiResponse) => setMessage(data.message))
      .catch((err) => setMessage(`Error: ${err.message}`));
  }, []);

  const handleAttritionUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadStatus('Uploading...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/api/upload-attrition-csv`, {
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

  const handleEnrollmentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleFinanceUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadStatus('Uploading...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('term', financialAidTerm);

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

  const handleFeeScreenshot = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!tuitionTerm) {
      setUploadStatus('Select year first');
    }
    setUploadStatus('Loading...');

    const formData = new FormData();
    formData.append(`file`, file);
    formData.append(`term`, tuitionTerm);
    try {
      const res = await fetch(`${API_URL}/api/upload-fee-image`, {
        method: 'POST',
        body: formData
      });
      const result = await res.json();

      if (res.ok) {
        setUploadStatus('Successful');
      }
      else {
        setUploadStatus(`Failed because of ${result.message}`);
      }
    }
    catch (err) {
      setUploadStatus(`Could not upload`)
    }
  }

  const handleTuitionScreenshot = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!tuitionTerm) {
        setUploadStatus('Please select a term before uploading');
        return;
      }
      setUploadStatus('Uploading...');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('term', tuitionTerm);

      try {
        const res = await fetch(`${API_URL}/api/upload-tuition-image`, {
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

  const handleAdmissionScreenshot = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setUploadStatus('Uploading...');

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch(`${API_URL}/api/upload-admission-image`, {
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

  const handleGenerateFinaidBarData = async () => {
    try {
      const result = await fetchFinaidBarData();
      if (result) {
        console.log('Financial aid bar chart data:', result);
        setFinaidBarData(result);
      } else {
        console.error('Failed to fetch financial aid bar chart data');
      }
    } catch (err) {
      console.error('Error fetching financial aid bar chart data:', err);
    }
  };

  const handleGenerateFinaidMultiBarData = async () => {
    try {
      const result = await fetchFinaidMultiBarData();
      if (result) {
        console.log('Financial aid multi bar chart data:', result);
        setFinaidMultiBarData(result);
      } else {
        console.error('Failed to fetch financial aid multi bar chart data');
      }
    } catch (err) {
      console.error('Error fetching financial aid bar chart data:', err);
    }
  };

  const handleGenerateFinaidIncreaseData = async () => {
    try {
      const result = await fetchFinaidIncreaseData();
      if (result) {
        console.log('Financial aid multi bar chart data:', result);
        setFinaidPercentIncrease(result);
      } else {
        console.error('Failed to fetch financial aid multi bar chart data');
      }
    }
    catch (err) {
      console.error('Error fetching financial aid bar chart data:', err)
    }
  }

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

  const handleGenerateTuitionGradeData = async () => {
    try {
      const result = await fetchTuitionGradeData(tuitionTerm);
      if (result) {
        setTuitionGradeData(result);
      }
    } catch (err) {
      console.error('Error fetching tuition by grade data:', err);
    }
  };

  const handleGenerateHighestTuitionYear = async () => {
    try {
      const result = await fetchHighestTuitionYearData();
      if (result) {
        setHighestTuitionYearData(result);
      }
    } catch (err) {
      console.error('Error fetching highest tuition by year data:', err);
    }
  };

  const handleGenerateTuitionIncreaseData = async () => {
    try {
      const result = await fetchTuitionIncreaseData();
      if (result) {
        setTuitionIncreaseData(result);
      }
    } catch (err) {
      console.error('Error fetching tuition increase by year data:', err);
    }
  };

  const handleGenerateFinaidPercentRevenue = async () => {
    try {
      const result = await fetchFinaidPercentRevenue();
      if (result) {
        setFinaidPercentRevenue(result);
      }
    } catch (err) {
      console.error('Error fetching finaid percent of revenue by year: ', err);
    }
  };

  const handleGenerateFinaidPercentRevenueDivision = async () => {
    try {
      const result = await fetchFinaidPercentRevenueDivision();
      if (result) {
        setFinaidPercentRevenueDivision(result);
      }
    } catch (err) {
      console.error('Error fetching finaid percent of revenue by year: ', err);
    }
  };

  const handleGenerateFinaidPercentRevenueGrade = async () => {
    try {
      console.log("The term on the drop down is ", fourPointSixTerm);
      const result = await fetchFinaidPercentRevenueGrade(fourPointSixTerm);
      if (result) {
        setFinaidPercentRevenueGrade(result);
      }
    } catch (err) {
      console.error('Error fetching finaid percent of revenue by year for grade: ', err);
    }
  };

  const handleGenerateFinaidRewardsGrade = async () => {
    try {
      console.log("The term on the drop down is ", fourPointSevenTerm);
      const result = await fetchFinaidRewardsGrade(fourPointSevenTerm);
      if (result) {
        setFinaidRewardsGrade(result);
      }
    } catch (err) {
      console.error('Error fetching finaid percent of revenue by year for grade: ', err);
    }
  };

  const handleGenerateFinaidRewardsSize = async () => {
    try {
      console.log("The term on the drop down is ", fourPointEightTerm);
      const result = await fetchFinaidRewardsSize(fourPointEightTerm);
      if (result) {
        setFinaidRewardsSize(result);
      }
    } catch (err) {
      console.error('Error fetching finaid rewards by size: ', err);
    }
  }

  const handleGenerateRemissionBar = async () => {
    try {
      const result = await fetchTuitionRemissionTerm();
      if (result) {
        setRemissionData(result);
      }
    } catch (err) {
      console.error('Error fetching finaid rewards by size: ', err);
    }
  }

  const handleGenerateRemissionGrossTuition = async () => {
    try {
      const result = await fetchRemissionToTuition();
      if (result) {
        setRemissionGrossTuitionData(result);
      }
    } catch (err) {
      console.error('Error fetching tuition remission data: ', err);
    }
  };

  const handleGenerateAllAidTuition = async () => {
    try {
      const result = await fetchAidRemissionPercent();
      if (result) {
        setAllAidTuitionData(result);
      }
    } catch (err) {
      console.error('Error fetching all aid to tuition data: ', err);
    }
  };

  const handleGenerateApplicationChart = async () => {
    try {
      const result = await fetchApplicationData();
      if (result) {
        setApplicationData(result);
      }
    }
    catch (err) {
      console.error('Error fetching application data: ', err);
    }
  };

  const handleGenerateApplicationNewStudentChart = async () => {
    try {
      const result = await fetchApplicationNewStudentData();
      if (result) {
        setApplicationNewStudentData(result);
      }
    }
    catch (err) {
      console.error('Error fetching application new student data: ', err);
    }
  };

  const handleGenerateSelectivityByYearChart = async () => {
    try {
      const result = await fetchSelectivityByYearData();
      if (result) {
        setSelectivityByYearData(result);
      }
    }
    catch (err) {
      console.error('Error fetching selectivity by year data: ', err);
    }
  };

  const handleGenerateYieldByYearChart = async () => {
    try {
      const result = await fetchYieldByYearData();
      if (result) {
        setYieldByYearData(result);
      }
    }
    catch (err) {
      console.error('Error fetching yield by year data: ', err);
    }
  };

  const handleGenerateAdmissionTrends = async () => {
    try {
      const result = await fetchAllAdmissionData();
      if (result) {
        setAllAdmissionData(result);
      }
    } catch (err) {
      console.error('Error fetching admission trends data: ', err);
    }
  };

  const handleGenerateAttritionProportion = async () => {
    try {
      const result = await fetchAttritionProportionData();
      if (result) {
        setAttritionProportionData(result);
      }
    } catch (err) {
      console.error('Error fetching attrition proportion data: ', err);
    }
  };

  const handleGenerateAttritionDivisionProportion = async () => {
    try {
      const result = await fetchAttritionDivisionProportionData();
      if (result) {
        setAttritionDivisionProportionData(result);
      }
    } catch (err) {
      console.error('Error fetching division attrition proportion data: ', err);
    }
  };

  // const handleGenerateFinaidRewardsGrade = async () => {
  //   try {
  //     const result = await fetchFinaidRewardsGrade();
  //     if (result) {
  //       setFinaidPercentRevenueGrade(result);
  //     }
  //   } catch (err) {
  //     console.error('Error fetching finaid users by grade: ', err);
  //   }
  // }

  if (showInstructions) {
    return (
      <div style={{ fontFamily: "'DM Sans', Arial, sans-serif", minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #eef4fb 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '0.5px solid #e5e7eb', background: '#fff' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px' }}>Operating Instructions</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Follow each section in order and complete every step before uploading.</div>
          </div>
          <button
            type="button"
            onClick={() => setShowInstructions(false)}
            style={{ fontSize: 13, fontWeight: 600, padding: '8px 14px', borderRadius: 8, border: '0.5px solid #d1d5db', background: '#fff', cursor: 'pointer' }}
          >
            Back to Dashboard
          </button>
        </div>

        <div style={{ maxWidth: 980, margin: '1.5rem auto', padding: '0 1rem 2rem' }}>
          <div style={{ background: '#ffffff', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '0.9rem 1rem', color: '#374151', fontSize: 13, marginBottom: 14 }}>
            Tip: Each card below is one upload category. Use the listed workflow to gather files, then return to the dashboard and upload.
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {instructionsPlaceholder.map((item, index) => {
              const { title, steps } = formatInstruction(item);
              const highlights = getInstructionHighlights(title);
              return (
                <section
                  key={index}
                  style={{
                    background: '#fff',
                    border: '0.5px solid #dbe4f0',
                    borderRadius: 12,
                    padding: '1rem 1rem 0.95rem',
                    boxShadow: '0 6px 18px rgba(17, 24, 39, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#185FA5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                      {index + 1}
                    </div>
                    <h2 style={{ margin: 0, fontSize: 16, color: '#0f172a', fontWeight: 700 }}>{title}</h2>
                  </div>

                  {highlights.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      {highlights.map((hint) => (
                        <span
                          key={`${title}-${hint}`}
                          style={{
                            fontSize: 12,
                            color: '#1d4f8a',
                            background: '#ecf4fe',
                            border: '0.5px solid #bfd9f8',
                            borderRadius: 999,
                            padding: '3px 10px',
                            fontWeight: 600
                          }}
                        >
                          {hint}
                        </span>
                      ))}
                    </div>
                  )}

                  <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', color: '#1f2937', fontSize: 14, lineHeight: 1.65 }}>
                    {steps.map((step, stepIndex) => (
                      <li
                        key={`${index}-${stepIndex}`}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '28px 1fr',
                          gap: 8,
                          marginBottom: 8,
                          alignItems: 'start'
                        }}
                      >
                        <span
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background: '#f1f5f9',
                            border: '0.5px solid #d7dee9',
                            color: '#334155',
                            fontSize: 12,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: 1
                          }}
                        >
                          {stepIndex + 1}
                        </span>
                        <span style={{ display: 'block', paddingTop: 1 }}>{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => setShowInstructions(true)}
            style={{ fontSize: 12, fontWeight: 600, padding: '7px 12px', borderRadius: 8, border: '0.5px solid #d1d5db', background: '#fff', cursor: 'pointer' }}
          >
            Instructions
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#16a34a', background: '#f0fdf4', padding: '5px 10px', borderRadius: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
            {message}
          </div>
        </div>
      </div>

      {/* Upload bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1.5rem', background: '#f9fafb', borderBottom: '0.5px solid #e5e7eb' }}>
        <span style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>Enrollment</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, padding: '6px 12px', borderRadius: 8, border: '0.5px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>
          <input type="file" accept=".csv" onChange={handleEnrollmentUpload} style={{ display: 'none' }} />
          ↑ Upload Enrollment CSV Here
        </label>
        {uploadStatus && <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{uploadStatus}</span>}
      </div>

      {/* Upload bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1.5rem', background: '#f9fafb', borderBottom: '0.5px solid #e5e7eb' }}>
        <span style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>Attrition</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, padding: '6px 12px', borderRadius: 8, border: '0.5px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>
          <input type="file" accept=".csv" onChange={handleAttritionUpload} style={{ display: 'none' }} />
          ↑ Choose Attrition CSV file
        </label>
        {uploadStatus && <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{uploadStatus}</span>}
      </div>

      {/* Upload bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1.5rem', background: '#f9fafb', borderBottom: '0.5px solid #e5e7eb' }}>
        <span style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>Financial Aid - Please Select Year</span>
          <select
            value={financialAidTerm}
            onChange={(event) => setFinancialAidTerm(event.target.value)}
            style={{ padding: '6px 10px', borderRadius: 8, border: '0.5px solid #d1d5db', background: '#fff', fontSize: 13, color: '#111827' }}
          >
            <option value="2019-2020">2019-2020</option>
            <option value="2020-2021">2020-2021</option>
            <option value="2021-2022">2021-2022</option>
            <option value="2022-2023">2022-2023</option>
            <option value="2023-2024">2023-2024</option>
            <option value="2024-2025">2024-2025</option>
            <option value="2025-2026">2025-2026</option>
            <option value="2026-2027">2026-2027</option>
            <option value="2027-2028">2027-2028</option>
            <option value="2028-2029">2028-2029</option>
            <option value="2029-2030">2029-2030</option>
            <option value="2030-2031">2030-2031</option>
            <option value="2031-2032">2031-2032</option>
          </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, padding: '6px 12px', borderRadius: 8, border: '0.5px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>
          <input type="file" accept=".csv" onChange={handleFinanceUpload} style={{ display: 'none' }} />
          ↑ Please Upload Financial Aid CSV Here
        </label>
        {uploadStatus && <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{uploadStatus}</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1.5rem', background: '#f9fafb', borderBottom: '0.5px solid #e5e7eb' }}>
        <span style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>Admissions</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, padding: '6px 12px', borderRadius: 8, border: '0.5px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>
          <input type="file" accept=".png" onChange={handleAdmissionScreenshot} style={{ display: 'none' }} />
          ↑ Upload Admission Screenshot here
        </label>
        {uploadStatus && <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{uploadStatus}</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1.5rem', background: '#f9fafb', borderBottom: '0.5px solid #e5e7eb' }}>
        <span style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>Tuition and Fees - Please Select Year</span>
        <select
          value={tuitionTerm}
          onChange={(event) => setTuitionTerm(event.target.value)}
          style={{ padding: '6px 10px', borderRadius: 8, border: '0.5px solid #d1d5db', background: '#fff', fontSize: 13, color: '#111827' }}
        >
          <option value="2019-2020">2019-2020</option>
          <option value="2020-2021">2020-2021</option>
          <option value="2021-2022">2021-2022</option>
          <option value="2022-2023">2022-2023</option>
          <option value="2023-2024">2023-2024</option>
          <option value="2024-2025">2024-2025</option>
          <option value="2025-2026">2025-2026</option>
          <option value="2026-2027">2026-2027</option>
          <option value="2027-2028">2027-2028</option>
          <option value="2028-2029">2028-2029</option>
          <option value="2029-2030">2029-2030</option>
          <option value="2030-2031">2030-2031</option>
          <option value="2031-2032">2031-2032</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, padding: '6px 12px', borderRadius: 8, border: '0.5px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>
          <input type="file" accept=".png" onChange={handleTuitionScreenshot} style={{ display: 'none' }} />
          ↑ Upload Tuition Screenshot here
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, padding: '6px 12px', borderRadius: 8, border: '0.5px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>
          <input type="file" accept=".png" onChange={handleFeeScreenshot} style={{ display: 'none' }} />
          ↑ Upload Other Term Fees Here
        </label>
        {uploadStatus && <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{uploadStatus}</span>}
      </div>

      {/* Chart cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 12, padding: '1.25rem 1.5rem' }}>
        {[
          { label: 'Application Bar Chart', title: '1.1 - Completed Applications by Year', accent: '#185FA5', bg: '#E6F1FB', onClick: handleGenerateApplicationChart, chart: applicationData && <BarChartApplicationComponent data={applicationData} /> },
          { label: 'Application New Student', title: '1.2 - Number of Applications for Each New Student', accent: '#185FA5', bg: '#E6F1FB', onClick: handleGenerateApplicationNewStudentChart, chart: applicationNewStudentData && <ApplicationNewStudentComponent data={applicationNewStudentData} /> },
          { label: 'Selectivity by Year', title: '1.3 - Selectivity (Acceptances/Applications)', accent: '#185FA5', bg: '#E6F1FB', onClick: handleGenerateSelectivityByYearChart, chart: selectivityByYearData && <SelectivityByYearComponent data={selectivityByYearData} /> },
          { label: 'Yield by Year', title: '1.4 - Yield (New Students/Acceptances)', accent: '#185FA5', bg: '#E6F1FB', onClick: handleGenerateYieldByYearChart, chart: yieldByYearData && <YieldByYearComponent data={yieldByYearData} /> },
          { label: 'Admission Trends', title: '1.6 - General Admission Trends by Year', desc: 'Admission Trends', accent: '#185FA5', bg: '#E6F1FB', onClick: handleGenerateAdmissionTrends, chart: allAdmissionData && <AdmissionTrendsComponent data={allAdmissionData} /> },
          { label: 'Enrollment · Year', title: '2.1 - Enrollment per Grade by Year', accent: '#0F6E56', bg: '#E1F5EE', onClick: handleGenerateEnrollmentMultiBarChart, chart: enrollmentMultiBarData && <MultiBarChartEnrollmentYearComponent data={enrollmentMultiBarData} /> },
          { label: 'Enrollment · Division', title: '2.2 - Enrollment per Division by Year', accent: '#854F0B', bg: '#FAEEDA', onClick: handleGenerateEnrollmentDivisionLineData, chart: enrollmentDivisionLineData && <MultiLineGraphComponent data={enrollmentDivisionLineData} /> },
          { label: 'Enrollment · Division', title: '2.4 - Enrollment and Capacity by Division', desc: 'Side-by-side comparison across divisions and terms.', accent: '#993C1D', bg: '#FAECE7', onClick: handleGenerateEnrollmentDivisionMultiBarData, chart: enrollmentDivisionMultiBarData && <MultiBarChartEnrollmentDivisionComponent chartData={enrollmentDivisionMultiBarData.chartData} terms={enrollmentDivisionMultiBarData.terms} /> },
          { label: 'Capacity · Enrollment', title: '2.3 - Enrollment as % of Capacity', desc: 'Overlay enrollment against capacity limits.', accent: '#3B6D11', bg: '#EAF3DE', onClick: handleGenerateEnrollmentCapacityLineData, chart: enrollmentCapacityLineData && <LineGraphComponent data={enrollmentCapacityLineData} /> },
          { label: 'Financial Aid', title: '4.2 - Total Financial Aid Provided by Grade', desc: 'Comparison of financial aid distribution.', accent: '#185FA5', bg: '#E6F1FB', onClick: handleGenerateFinaidBarData, chart: finaidBarData && <BarChartComponent data={finaidBarData} /> },
          { label: 'Tuition by Grade (Year-Based)', title: 'Bar chart', desc: 'Comparison of tuition by grade for a given year.', accent: '#185FA5', bg: '#E6F1FB', onClick: handleGenerateTuitionGradeData, chart: tuitionGradeData && <BarChartComponent data={tuitionGradeData} /> },
          { label: 'Highest Tuition by Year', title: 'Bar chart', desc: 'Comparison of highest tuition by year.', accent: '#185FA5', bg: '#E6F1FB', onClick: handleGenerateHighestTuitionYear, chart: highestTuitionYearData && <BarChartComponent data={highestTuitionYearData} /> },
          { label: 'Tuition Increase by Year', title: 'Bar chart', desc: 'Comparison of tuition increases by year.', accent: '#185FA5', bg: '#E6F1FB', onClick: handleGenerateTuitionIncreaseData, chart: tuitionIncreaseData && <BarChartComponent data={tuitionIncreaseData} /> },
          { label: 'Financial Aid by Year', title: 'Multi Bar chart', desc: 'Comparison of financial aid given by year and grade', accent: '#185FA5', bg: '#E6F1FB', onClick: handleGenerateFinaidMultiBarData, chart: finAidMultiBarData && <MultiBarAidByGradeYear chartData={finAidMultiBarData} /> },
          { label: 'Financial Aid Percentage Increase by Year', title: 'Multi Bar Graph', desc: 'Percentage increase of financial aid overtime', accent: '#185FA5', bg: '#E6F1FB', onClick: handleGenerateFinaidIncreaseData, chart: finaidPercentIncrease && <MultiBarFinaidPercent chartData={finaidPercentIncrease} /> },
          { label: 'Finanaical Aid Percent of Total Revenue by Year', title: 'Line Graph', desc: 'Finaid Percent of Revenue', accent: '#185FA5', bg: '#E6F1FB', onClick: handleGenerateFinaidPercentRevenue, chart: finaidPercentRevenue && <LineGraphComponent data={finaidPercentRevenue} /> },
          { label: 'Finanaical Aid Percent of Total Revenue by Year per Division', title: 'Line Graph', desc: 'Finaid Percent of Revenue per Division', accent: '#185FA5', bg: '#E6F1FB', onClick: handleGenerateFinaidPercentRevenueDivision, chart: finaidPercentRevenueDivision && <FinaidPercentTuitionMultiLineComponent data={finaidPercentRevenueDivision} /> },
          { label: 'Finanaical Aid Percent of Total Revenue by Year per Grade', title: 'Bar Chart', desc: 'Finaid Percent of Revenue per Grade', accent: '#185FA5', bg: '#E6F1FB', onClick: handleGenerateFinaidPercentRevenueGrade, control: (
            <select
              value={fourPointSixTerm || '2024-2025'}
              onChange={(e) => setFourPointSixTerm(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '0.5px solid #d1d5db', background: '#fff', fontSize: 13, color: '#111827', marginBottom: 8 }}
            >
              <option value="2019-2020">2019-2020</option>
              <option value="2020-2021">2020-2021</option>
              <option value="2021-2022">2021-2022</option>
              <option value="2022-2023">2022-2023</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
              <option value="2027-2028">2027-2028</option>
              <option value="2028-2029">2028-2029</option>
              <option value="2029-2030">2029-2030</option>
              <option value="2030-2031">2030-2031</option>
              <option value="2031-2032">2031-2032</option>
            </select>
          ), chart: finaidPercentRevenueGrade && <BarChartGradeComponent data={finaidPercentRevenueGrade} /> },
          { label: 'Number of Financial Aid Recipients by Grade', title: 'Bar Chart', desc: 'Number of Financial Aid Receipients per Grade', accent: '#185FA5', bg: '#E6F1FB', onClick: handleGenerateFinaidRewardsGrade, control: (
            <select
              value={fourPointSevenTerm || '2024-2025'}
              onChange={(e) => setFourPointSevenTerm(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '0.5px solid #d1d5db', background: '#fff', fontSize: 13, color: '#111827', marginBottom: 8 }}
            >
              <option value="2019-2020">2019-2020</option>
              <option value="2020-2021">2020-2021</option>
              <option value="2021-2022">2021-2022</option>
              <option value="2022-2023">2022-2023</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
              <option value="2027-2028">2027-2028</option>
              <option value="2028-2029">2028-2029</option>
              <option value="2029-2030">2029-2030</option>
              <option value="2030-2031">2030-2031</option>
              <option value="2031-2032">2031-2032</option>
            </select>
          ), chart: finaidRewardsGrade && <BarChartFinaidGradeComponent data={finaidRewardsGrade} /> },
          { label: 'Size of Financial Aid Rewards', title: 'Pie Chart', desc: 'Size of Financial Aid Rewards relative to tuition', accent: '#185FA5', bg: '#E6F1FB', onClick: handleGenerateFinaidRewardsSize, control: (
            <select
              value={fourPointEightTerm || '2024-2025'}
              onChange={(e) => setFourPointEightTerm(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 8, border: '0.5px solid #d1d5db', background: '#fff', fontSize: 13, color: '#111827', marginBottom: 8 }}
            >
              <option value="2019-2020">2019-2020</option>
              <option value="2020-2021">2020-2021</option>
              <option value="2021-2022">2021-2022</option>
              <option value="2022-2023">2022-2023</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
              <option value="2027-2028">2027-2028</option>
              <option value="2028-2029">2028-2029</option>
              <option value="2029-2030">2029-2030</option>
              <option value="2030-2031">2030-2031</option>
              <option value="2031-2032">2031-2032</option>
            </select>
          ), chart: finaidRewardsSize && <PieChartFinaidComponent data={finaidRewardsSize} /> },
          { label: 'Remission Bar Chart', title: 'Bar Chart', desc: 'Total Remission by Year', accent: '#185FA5', bg: '#E6F1FB', onClick: handleGenerateRemissionBar, chart: remissionData && <BarChartRemissionComponent data={remissionData} /> },
          { label: 'Remission to Tuition Line Graph', title: 'Line Graph', desc: 'Total Remission relative to Gross Tuition by Year', accent: '#185FA5', bg: '#E6F1FB', onClick: handleGenerateRemissionGrossTuition, chart: remissionGrossTuitionData && <RemissionGrossTuitionComponent data={remissionGrossTuitionData} /> },
          { label: 'All Aid to Tuition Line Graph', title: 'Line Graph', desc: 'All aid relative to Gross Tuition by Year', accent: '#185FA5', bg: '#E6F1FB', onClick: handleGenerateAllAidTuition, chart: allAidTuitionData && <AllAidTuitionComponent data={allAidTuitionData} /> },
          { label: 'Attrition Proportion', title: 'Bar Chart', desc: 'Proportion of Students Who Withdraw by Year', accent: '#185FA5', bg: '#E6F1FB', onClick: handleGenerateAttritionProportion, chart: attritionProportionData && <AttritionProportionComponent data={attritionProportionData} /> },
          { label: 'Attrition Proportion by Division', title: 'Multi Bar Chart', desc: 'Withdrawals as a percentage of enrollment for K-5, 6-8, and 9-11 by year', accent: '#185FA5', bg: '#E6F1FB', onClick: handleGenerateAttritionDivisionProportion, chart: attritionDivisionProportionData && <MultiBarFinaidPercent chartData={attritionDivisionProportionData} /> },
        ].map(({ label, title, desc, accent, bg, onClick, chart, control }, index) => {
          const chartKey = `${title}-${index}`;
          const hasChart = Boolean(chart);

          return (
          <div key={chartKey} style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#9ca3af', fontFamily: 'monospace', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{title}</div>
              </div>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, flexShrink: 0 }}>◈</div>
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>{desc}</div>
            {control}
            <button type="button" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 'auto', fontSize: 13, fontWeight: 500, padding: '7px 14px', borderRadius: 8, border: '0.5px solid #d1d5db', background: '#fff', cursor: 'pointer', width: 'fit-content' }}>
              ▶ Generate
            </button>
            <button
              type="button"
              onClick={() => handleDownloadChart(chartKey, title)}
              disabled={!hasChart}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 500,
                padding: '7px 14px',
                borderRadius: 8,
                border: '0.5px solid #d1d5db',
                background: hasChart ? '#fff' : '#f3f4f6',
                color: hasChart ? '#111827' : '#9ca3af',
                cursor: hasChart ? 'pointer' : 'not-allowed',
                width: 'fit-content'
              }}
              title={hasChart ? 'Download chart as PNG' : 'Generate chart first'}
            >
              ↓ Download Chart
            </button>
            <div ref={(node) => { chartDownloadRefs.current[chartKey] = node; }}>
              {chart}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
};

export default App;
