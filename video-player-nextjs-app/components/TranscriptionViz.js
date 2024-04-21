// components/TranscriptionViz.js
import React, { useState, useEffect } from 'react';
import TranscriptionAnalysis from './TranscriptionAnalysis';

const TranscriptionViz = ({ jsonData, currentTime, videoRef, onTranscriptsChange, rating }) => {
  // State to hold the analysis result
  const [analysisResult, setAnalysisResult] = useState('');
  // State to hold the all transcriptions
  const [transcripts, setTranscripts] = useState('');
  // State to hold the selected transcript for analysis
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const handleWordClick = (seconds) => {
    console.log('seconds:', seconds, 'videoRef:', videoRef)
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
              allTranscripts += (alternative.transcript + ' ');
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

  const getTranscriptions = () => {
    return jsonData.annotation_results
      .filter(ar => 'speech_transcriptions' in ar)
      .flatMap(ar => ar.speech_transcriptions)
      .map(st => {
        const alternatives = st.alternatives;
        if (alternatives && alternatives.length > 0) {
          const words = alternatives[0].words;
          if (words && words.length > 0) {
            const startTime = words[0].start_time.seconds + (words[0].start_time.nanos || 0) / 1e9;
            const endTime = words[words.length - 1].end_time.seconds + (words[words.length - 1].end_time.nanos || 0) / 1e9;
            return {
              transcript: alternatives[0].transcript,
              startTime: startTime,
              endTime: endTime,
              words: words
            };
          }
        }
        return null;
      })
      .filter(transcription => transcription !== null);
  };

  const transcriptions = getTranscriptions();

  const getCurrentTranscription = () => {
    return transcriptions.find(transcription =>
      transcription.startTime <= currentTime && transcription.endTime >= currentTime
    );
  };

  const currentTranscription = getCurrentTranscription();

  const handleAnalyzeClick = (transcript) => {
    setSelectedTranscript(transcript);
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
            <button onClick={() => handleAnalyzeClick(currentTranscription.transcript)}>
              Analyze
            </button>
          </>
        )}
      </div>
      {selectedTranscript && (
        <TranscriptionAnalysis
          transcript={selectedTranscript}
          fullContent={transcripts}
          rating={rating}
        />
      )}
    </div>
  );
};

export default TranscriptionViz;