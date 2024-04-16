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
        const decoder = new TextDecoder('utf-8');
        
        // Function to process the stream
        const processText = async ({ done, value }) => {
          if (done) {
            setIsLoading(false);
            return;
          }
          // Decode the stream chunk and remove the "0:\"" prefix
          const chunk = decoder.decode(value);
          const cleanedChunk = chunk.replace(/0:\\?"([^"]*)\\?"/g, '$1');
          setResponse(prevResponse => prevResponse + cleanedChunk);
          // Continue reading
          return reader.read().then(processText);
        };

        // Start reading from the stream
        reader.read().then(processText);
      } catch (err) {
        setIsLoading(false);
        setError('Failed to fetch response from GPT: ' + err.message);
      }
    };

    fetchStream();

    // Clean up function to reset loading state on component unmount
    return () => {
      setIsLoading(false);
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
