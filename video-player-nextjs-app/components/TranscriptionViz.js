// components/TranscriptionViz.js
import React, { useState, useEffect } from 'react';
import TranscriptionAnalysis from './TranscriptionAnalysis';

const TranscriptionViz = ({ jsonData, currentTime, videoRef, onTranscriptsChange, rating }) => {
  // State to hold the analysis results
  const [analysisResults, setAnalysisResults] = useState({});

  // State to hold all transcriptions
  const [transcripts, setTranscripts] = useState('');

  const handleWordClick = (seconds) => {
    console.log('seconds:', seconds, 'videoRef:', videoRef);
    if (videoRef.current) {
      videoRef.current.seekTo(seconds);
    }
  };

  useEffect(() => {
    if (jsonData && jsonData.annotation_results) {
      let allTranscripts = '';
      jsonData.annotation_results.forEach((result) => {
        result.speech_transcriptions?.forEach((transcription) => {
          transcription.alternatives.forEach((alternative) => {
            if (alternative.transcript) {
              allTranscripts += alternative.transcript + ' ';
            }
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
  
  // Clear analysis results when the rating changes
  useEffect(() => {
    setAnalysisResults({}); // Clear analysis results when the rating changes
  }, [rating]);

  const getTranscriptions = () => {
    return jsonData.annotation_results
      .filter((ar) => 'speech_transcriptions' in ar)
      .flatMap((ar) => ar.speech_transcriptions)
      .map((st) => {
        const alternatives = st.alternatives;
        if (alternatives && alternatives.length > 0) {
          const words = alternatives[0].words;
          if (words && words.length > 0) {
            const startTime = words[0].start_time.seconds + (words[0].start_time.nanos || 0) / 1e9;
            const endTime = words[words.length - 1].end_time.seconds + (words[words.length - 1].end_time.nanos || 0) / 1e9;
            return {
              id: `${startTime}-${endTime}`, // Generate a unique identifier for each transcription
              transcript: alternatives[0].transcript,
              startTime: startTime,
              endTime: endTime,
              words: words,
            };
          }
        }
        return null;
      })
      .filter((transcription) => transcription !== null);
  };

  const transcriptions = getTranscriptions();

  const getCurrentTranscription = () => {
    return transcriptions.find(
      (transcription) => transcription.startTime <= currentTime && transcription.endTime >= currentTime
    );
  };

  const currentTranscription = getCurrentTranscription();

  const handleAnalyzeClick = (transcriptionId, transcript) => {
    // setAnalysisResults((prevResults) => ({
    //   ...prevResults,
    //   [transcriptionId]: transcript,
    // }));
    setAnalysisResults({
      [transcriptionId]: transcript
    });
  };

  // return (
  //   <div>
  //     <p>Current transcription at {currentTime.toFixed(2)}s:</p>
  //     <div>
  //       {currentTranscription && (
  //         <>
  //           <span>
  //             {currentTranscription.words.map((word, index) => (
  //               <span
  //                 key={index}
  //                 onClick={() => handleWordClick(word.start_time.seconds + (word.start_time.nanos || 0) / 1e9)}
  //                 style={{ cursor: 'pointer', marginRight: '4px' }}
  //               >
  //                 {word.word}
  //               </span>
  //             ))}
  //           </span>
  //           <button onClick={() => handleAnalyzeClick(currentTranscription.id, currentTranscription.transcript)}>
  //             Analyze
  //           </button>
  //         </>
  //       )}
  //     </div>
  //     {/* {Object.entries(analysisResults).map(([transcriptionId, transcript]) => (
  //       <TranscriptionAnalysis
  //         key={transcriptionId}
  //         transcript={transcript}
  //         fullContent={transcripts}
  //         rating={rating}
  //       />
  //     ))} */}
  //     {currentTranscription && currentTranscription.id in analysisResults && (
  //       <TranscriptionAnalysis
  //         key={currentTranscription.id}
  //         transcript={analysisResults[currentTranscription.id]}
  //         fullContent={transcripts}
  //         rating={rating}
  //       />
  //     )}
  //   </div>
  // );


return (
  <div>
    {/* Transcript container on the left with detailed styling */}
    <div style={{
      width: '90%',
      maxWidth: '1000px',
      maxHeight: '400px',
      minHeight: '100px',
      margin: 'auto',
      boxSizing: 'border-box',
      overflowY: 'auto',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      border: '2px solid #45497d',
      padding: '10px',
      fontSize: '20px',
      marginTop: '20px'
    }}>
      <p>Current transcription at {currentTime.toFixed(2)}s:</p>
      <div>
        {currentTranscription && (
          <>
            <div style={{ marginBottom: '20px' }}>
              {currentTranscription.words.map((word, index) => (
                <span
                  key={index}
                  onClick={() => handleWordClick(word.start_time.seconds + (word.start_time.nanos || 0) / 1e9)}
                  style={{ cursor: 'pointer', marginRight: '4px' }}
                >
                  {word.word}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>

    {/* Analysis container on the right with similar styling */}
    <div style={{
      width: '90%',
      maxWidth: '1000px',
      maxHeight: '400px',
      minHeight: '100px',
      margin: 'auto',
      boxSizing: 'border-box',
      overflowY: 'auto',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      border: '2px solid #45497d',
      padding: '10px',
      fontSize: '20px',
      marginTop: '20px'
    }}>
      {currentTranscription && (
        <>
          <button onClick={() => handleAnalyzeClick(currentTranscription.id, currentTranscription.transcript)} 
          style={{ 
            borderRadius: '10px', 
            border: '2px solid #5F6AE6', 
            color: '#5F6AE6', 
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: 'white',
            fontSize: '16px'
          }}
          >
            Analyze
          </button>
          {currentTranscription.id in analysisResults && (
            <TranscriptionAnalysis
              key={currentTranscription.id}
              transcript={analysisResults[currentTranscription.id]}
              fullContent={transcripts}
              rating={rating}
            />
          )}
        </>
      )}
    </div>
  </div>
);



  

};

export default TranscriptionViz;