import React, { useState, useEffect } from 'react';

const TranscriptionsDisplay = ({ jsonData, onTranscriptsChange }) => {
  const [transcripts, setTranscripts] = useState('');

  useEffect(() => {
    if (jsonData && jsonData.annotation_results) {
      let allTranscripts = '';
      jsonData.annotation_results.forEach((result) => {
        result.speech_transcriptions?.forEach((transcription) => {
          transcription.alternatives.forEach((alternative) => {
            allTranscripts += alternative.transcript + ' ';
          });
        });
      });
      const trimmedTranscripts = allTranscripts.trim();
      setTranscripts(trimmedTranscripts);
      if (onTranscriptsChange) {
        onTranscriptsChange(trimmedTranscripts);
      }
    }
  }, [jsonData, onTranscriptsChange]);

  return (
    <div>
      <h2>Transcripts</h2>
      <p>{transcripts}</p>
    </div>
  );
};

export default TranscriptionsDisplay;
