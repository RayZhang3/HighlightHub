// component/TranscriptionsDisplay.js
import React, { useState, useEffect } from 'react';

const TranscriptionsDisplay = ({ jsonData, onTranscriptsChange, currentTime }) => {
  const [transcripts, setTranscripts] = useState(''); 


// Function to process text into lines with limited words and ending periods
const processTranscripts = (text, maxWords = 15) => {
  const words = text.split(' ');
  let currentLine = '';
  let lines = [];
  let wordCount = 0;

  words.forEach(word => {
    if (wordCount < maxWords) {
      currentLine += word + ' ';
      wordCount++;
    }

    // Check if we reach max words or a period
    if (wordCount >= maxWords || word.endsWith('.')) {
      lines.push(currentLine.trim());
      currentLine = '';
      wordCount = 0; // reset word count for a new line
    }
  });

  // Add last line if there's any residual content
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines.join('\n'); // Use newline character to separate lines
};


useEffect(() => {
  if (jsonData && jsonData.annotation_results) {
    let allTranscripts = '';  // Properly declare the variable.
    jsonData.annotation_results.forEach((result) => {
      result.speech_transcriptions?.forEach((transcription) => {
        transcription.alternatives.forEach((alternative) => {
          // check if the transcript text is "defined" before appending 
          if (alternative.transcript) {
            allTranscripts += (alternative.transcript + ' ');
          }
        });
      });
    });
    const trimmedTranscripts = allTranscripts.trim();
    const formattedTranscripts = processTranscripts(trimmedTranscripts);
    setTranscripts(formattedTranscripts);

    if (onTranscriptsChange) {
      onTranscriptsChange(formattedTranscripts);
    }
  }
}, [jsonData, onTranscriptsChange]);  // Ensure dependencies are listed correctly.


  return (
    <div>
        <h2
        style={{ color: '#45497d',
        fontSize: '24px'}}>
          Transcripts</h2>
        {/* Scrollable preformatted text block */}
        <pre style={{
            width: '700px',          // Set the width to 80% of its container
            // maxWidth: '1000px',     // Optionally limit the maximum width
            maxHeight: '400px',    // Maximum height before scrolling
            minHeight: '100px',    // Minimum height, even if empty
            boxSizing: 'border-box', // Includes padding and border in the width calculation
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            border: '2px solid #45497d',
            padding: '10px',
            fontSize: '16px',
            marginRight: '20px'
        }}>
            {transcripts}
        </pre>
    </div>
);


}; 

export default TranscriptionsDisplay;


