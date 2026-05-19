import React, { useState, useEffect } from 'react';

interface ApiResponse {
  message: string;
}

const App: React.FC = () => {
  const [message, setMessage] = useState<string>('Loading...');

  useEffect(() => {
    // Fetch data from backend
    fetch('http://localhost:5000/api/hello')
      .then((res) => res.json())
      .then((data: ApiResponse) => setMessage(data.message))
      .catch((err) => setMessage(`Error: ${err.message}`));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Full Stack App</h1>
      <p>Message from backend: <strong>{message}</strong></p>
    </div>
  );
};

export default App;
