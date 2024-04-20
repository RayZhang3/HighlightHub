import React, { useEffect, useState } from 'react';

const GptResponseDisplay = ({ prompt }) => {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!prompt) return;
    setIsLoading(true);
    
    const fetchStream = async () => {
      let cancel = false; // If the component is unmounted, set this to true to cancel reading the stream

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
          if (cancel) {
            return; // If the component is unmounted, stop reading the stream
          }

          // Decode the stream chunk
          const chunk = decoder.decode(value, {stream: true});
          
          try {
            // Try to parse the chunk as JSON
            const jsonChunk = JSON.parse(chunk);
            console.log('jsonChunk', jsonChunk)
            setResponse(prevResponse => prevResponse + jsonChunk.data);
          } catch (error) {
            // If the chunk is not valid JSON, just append it as text
            setResponse(prevResponse => prevResponse + chunk);
            console.log('can not parse chunk as JSON')
            console.log('chunk', chunk)
          }
          
          // Continue reading
          return reader.read().then(processText);
        };

        // Start reading from the stream
        reader.read().then(processText);
      } catch (err) {
        if (!cancel) { // If the component is unmounted, don't set the error
          setIsLoading(false);
          setError('Failed to fetch response from GPT: ' + err.message);
        }
      }

      // Clean up function to reset loading state and cancel reading on component unmount
      return () => {
        setIsLoading(false);
        cancel = true; // Set cancel to true to stop reading the stream
      };
    };

    fetchStream();
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
