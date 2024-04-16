import React, { useState, useEffect } from 'react';

const TranscriptionsDisplay = ({ jsonData }) => {
  const [transcripts, setTranscripts] = useState('');

  useEffect(() => {
    if (jsonData && jsonData.annotation_results) {
      let allTranscripts = '';
      
      // Iterate annotation_results Array
      jsonData.annotation_results.forEach((result) => {
        // Get speech_transcriptions 
        if (result.speech_transcriptions) {
          result.speech_transcriptions.forEach((transcription) => {
            // Iterate transcription alternatives array
            transcription.alternatives.forEach((alternative) => {
              // Iterate alternatives 的 transcript
              allTranscripts += alternative.transcript + ' ';
            });
          });
        }
      });

      setTranscripts(allTranscripts.trim()); // 使用 trim 移除最后一个空格
    }
  }, [jsonData]); // jsonData 改变时触发 useEffect

  return (
    <div>
      <h2>Transcripts</h2>
      <p>{transcripts}</p>
    </div>
  );
};

export default TranscriptionsDisplay;
