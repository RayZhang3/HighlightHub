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
    <div
    style={{
      display: 'flex',  // Enables Flexbox
      flexDirection: 'row', // Aligns children in a row
      justifyContent: 'space-between', // Distributes space between the components
      alignItems: 'flex-start', // Aligns items to the top of the container
      height: '100vh', // Optional: Adjusts the height of the container
      padding: '20px'  // Provides some padding around the items
    }}
    >
      <TranscriptionsDisplay jsonData={jsonData} onTranscriptsChange={setTranscripts} />

      <div 
      // style={{ marginLeft: '20px', flex: 1 }}
      style={{
        width: '500px',
        // maxWidth: '1000px',
        maxHeight: '400px',
        minHeight: '100px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        border: '2px solid #45497d',
        padding: '10px',
        fontSize: '20px',
        marginTop: '65px'
      }}
      >
        <button onClick={handleAnalyzeClick} style={{
          color: '#45497d', // Text color for the options
          border: '2px solid #45497d',
          borderRadius: '10px', // Rounded corners
          padding: '8px 5px', // Padding for the select box
          width: 'auto', // Default width or adjust as necessary
          marginBottom: '20px',
          marginTop: '20px',
          backgroundColor: 'white',
          fontSize: '16px'
        }}>Analyze with GPT-3</button>
        {triggerAnalysis && <GptResponseDisplay prompt={transcripts} />}
      </div>
    </div>
  );
};

export default DisplayJson;
