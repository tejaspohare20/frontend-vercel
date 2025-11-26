import { useEffect } from 'react';

const TestEnv = () => {
  useEffect(() => {
    console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    console.log('All env vars:', import.meta.env);
  }, []);

  return (
    <div>
      <h1>Environment Variables Test</h1>
      <p>Check the browser console for environment variable values.</p>
    </div>
  );
};

export default TestEnv;