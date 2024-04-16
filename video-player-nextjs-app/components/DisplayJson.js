// components/DisplayJson.js
import React, { useState } from 'react';
import TranscriptionsDisplay from './TranscriptionsDisplay';
import GptResponseDisplay from './GptResponseDisplay';

const DisplayJson = ({ jsonData }) => {
  const [transcripts, setTranscripts] = useState('');
  const [triggerAnalysis, setTriggerAnalysis] = useState(false);

  // This function will be called when the button is clicked.
  const handleAnalyzeClick = () => {
    setTriggerAnalysis(true); // Set the trigger for analysis
  };

  return (
    <div>
      <TranscriptionsDisplay jsonData={jsonData} onTranscriptsChange={setTranscripts} />
      <button onClick={handleAnalyzeClick}>Analyze with GPT-3</button>
      {triggerAnalysis && <GptResponseDisplay prompt={transcripts} />}
    </div>
  );
};

export default DisplayJson;
