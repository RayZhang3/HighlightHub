// GptGetWord.js
import React, { useEffect, useState } from 'react';

const GptGetWord = ({ word, rating }) => {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [partialData, setPartialData] = useState('');

  useEffect(() => {
    let cancel = false;
    setIsLoading(true);

    async function fetchStream() {
      try {
        const response = await fetch('/api/gptword', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word, rating }),
        });

        if (!response.body) {
          throw new Error('Failed to get a response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        const processText = async ({ done, value }) => {
          if (cancel) return;
          if (done) {
            setIsLoading(false);
            if (partialData) {
              const finalText = transformText(partialData);
              setResponse(prevResponse => prevResponse + finalText);
              setPartialData('');
            }
            return;
          }

          const chunk = decoder.decode(value, { stream: true });
          const completeData = partialData + chunk;
          const lastQuoteIndex = completeData.lastIndexOf('"');
          const processData = completeData.substring(0, lastQuoteIndex + 1);
          const updatedText = transformText(processData);

          setResponse(prevResponse => prevResponse + updatedText);
          setPartialData(completeData.substring(lastQuoteIndex + 1));

          return reader.read().then(processText);
        };

        reader.read().then(processText);
      } catch (err) {
        if (!cancel) {
          setIsLoading(false);
          setError('Failed to fetch response from GPT: ' + err.message);
        }
      }
    }

    fetchStream();

    return () => {
      cancel = true;
      setIsLoading(false);
    };
  }, [word, rating]);

  function transformText(data) {
    const linePattern = /0:"([^"]*)"/g;
    let match;
    let finalText = '';

    while ((match = linePattern.exec(data)) !== null) {
      finalText += match[1].replace(/\\n/g, "\n");
    }

    return finalText;
  }

  return (
    <div>
      <h4>Explanation for [{word}] :</h4>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <p>{response}</p>
    </div>
  );
};

export default GptGetWord;