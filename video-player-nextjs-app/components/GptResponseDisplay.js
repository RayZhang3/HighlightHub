// components/GptResponseDisplay.js
import React, { useEffect, useState } from 'react';

const GptResponseDisplay = ({ prompt }) => {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!prompt) return;
    setIsLoading(true);
    
    const fetchStream = async () => {
      try {
        const response = await fetch('/api/gpt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });

        if (!response.body) {
          throw new Error('Failed to get a response body');
        }

        const reader = response.body.getReader();
        reader.read().then(function processText({ done, value }) {
          if (done) {
            setIsLoading(false);
            return;
          }
          setResponse(prevResponse => prevResponse + new TextDecoder().decode(value));
          return reader.read().then(processText);
        });
      } catch (err) {
        setIsLoading(false);
        setError('Failed to fetch response from GPT: ' + err.message);
      }
    };
    
    fetchStream();

    return () => {
      setIsLoading(false); // Clean up function to reset loading state
    };
  }, [prompt]);

  return (
    <div>
      <h3>GPT Response</h3>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <p>{response}</p>
    </div>
  );
};

export default GptResponseDisplay;
