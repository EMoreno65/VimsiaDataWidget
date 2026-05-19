import React, { useState, useEffect } from 'react';

interface ApiResponse {
  message: string;
}

const App: React.FC = () => {
  const [message, setMessage] = useState<string>('Loading...');

  // useEffect means the action inside will run once when the component mounts
  // the component mounting means the first time it appears on the screen
  useEffect(() => {
    fetch('http://localhost:4000/api/hello') // Backend api is local for now
      .then((res) => res.json()) // Parse the response as JSON, which is the format our backend sends data in
      .then((data: ApiResponse) => setMessage(data.message)) // Set the message state to the message we got from the backend, which will cause the component to re-render and show the new message
      .catch((err) => setMessage(`Error: ${err.message}`)); // If there's an error (like the backend isn't running), set the message to show the error instead
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Full Stack App</h1>
      <p>Message from backend: <strong>{message}</strong></p>
    </div>
  );
};

export default App;
