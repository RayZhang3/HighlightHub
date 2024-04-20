import React, { useEffect, useState } from 'react';

const GptResponseDisplay = ({ prompt }) => {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [partialData, setPartialData] = useState(''); // To store partial data across chunks

  useEffect(() => {
    let cancel = false; // To control the cleanup and cancellation of the stream
    setIsLoading(true);

    async function fetchStream() {
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
          if (cancel) return; // If the component is unmounted, stop processing
          if (done) {
            setIsLoading(false);
            // Process any remaining partial data
            if (partialData) {
              const finalText = transformText(partialData);
              setResponse(prevResponse => prevResponse + finalText);
              setPartialData('');
            }
            return;
          }

          // Decode the stream chunk
          const chunk = decoder.decode(value, { stream: true });
          const completeData = partialData + chunk;
          const lastQuoteIndex = completeData.lastIndexOf('"');
          const processData = completeData.substring(0, lastQuoteIndex + 1);
          const updatedText = transformText(processData);

          // Update response with the new text
          setResponse(prevResponse => prevResponse + updatedText);

          // Save the unfinished part of the data
          setPartialData(completeData.substring(lastQuoteIndex + 1));

          // Continue reading
          return reader.read().then(processText);
        };

        // Start reading from the stream
        reader.read().then(processText);
      } catch (err) {
        if (!cancel) {
          setIsLoading(false);
          setError('Failed to fetch response from GPT: ' + err.message);
        }
      }
    }

    fetchStream();

    // Cleanup function to cancel reading on component unmount
    return () => {
      cancel = true;
      setIsLoading(false);
    };
  }, [prompt]);

  // Helper function to transform text based on the regex pattern
  function transformText(data) {
    const linePattern = /0:"([^"]*)"/g;
    let match;
    let finalText = '';

    // Using regex to match and capture each line token
    while ((match = linePattern.exec(data)) !== null) {
      // Replace escaped newline characters with actual newlines
      finalText += match[1].replace(/\\n/g, "\n");
    }

    return finalText;
  }

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
