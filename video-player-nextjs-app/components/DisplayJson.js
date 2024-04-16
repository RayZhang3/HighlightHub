// components/DisplayJson.js
import React, { useState, useEffect } from 'react';
import TranscriptionsDisplay from './TranscriptionsDisplay';
import GptResponseDisplay from './GptResponseDisplay';


const DisplayJson = ({ jsonData }) => {
  const [transcripts, setTranscripts] = useState('');

  useEffect(() => {
    // Assuming TranscriptionsDisplay calls this effect when transcripts change
  }, [transcripts]);

  return (
    <div>
      <TranscriptionsDisplay jsonData={jsonData} onTranscriptsChange={setTranscripts} />
      {transcripts && <GptResponseDisplay prompt={transcripts} />}
    </div>
  );
};

export default DisplayJson;
