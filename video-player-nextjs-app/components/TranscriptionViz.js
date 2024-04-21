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

  return (
    <div>
      <p>Current transcription at {currentTime.toFixed(2)}s:</p>
      <div>
        {currentTranscription && (
          <>
            <span>
              {currentTranscription.words.map((word, index) => (
                <span
                  key={index}
                  onClick={() => handleWordClick(word.start_time.seconds + (word.start_time.nanos || 0) / 1e9)}
                  style={{ cursor: 'pointer', marginRight: '4px' }}
                >
                  {word.word}
                </span>
              ))}
            </span>
            <button onClick={() => handleAnalyzeClick(currentTranscription.id, currentTranscription.transcript)}>
              Analyze
            </button>
          </>
        )}
      </div>
      {/* {Object.entries(analysisResults).map(([transcriptionId, transcript]) => (
        <TranscriptionAnalysis
          key={transcriptionId}
          transcript={transcript}
          fullContent={transcripts}
          rating={rating}
        />
      ))} */}
      {currentTranscription && currentTranscription.id in analysisResults && (
        <TranscriptionAnalysis
          key={currentTranscription.id}
          transcript={analysisResults[currentTranscription.id]}
          fullContent={transcripts}
          rating={rating}
        />
      )}
    </div>
  );
};

export default TranscriptionViz;