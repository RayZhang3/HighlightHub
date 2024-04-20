import React from 'react';

const TranscriptionViz = ({ jsonData, currentTime, videoRef }) => {
  const handleWordClick = (seconds) => {
    console.log('seconds:', seconds, 'videoRef:', videoRef)
    if (videoRef.current) {
        videoRef.current.seekTo(seconds);
      }
  };

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
            //console.log('startTime:', startTime, 'endTime:', endTime, 'words:', words)
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

  return (
    <div>
      <p>Current transcription at {currentTime.toFixed(2)}s:</p>
      <div>
        {currentTranscription && currentTranscription.words.map((word, index) => (
          <span
            key={index}
            onClick={() => handleWordClick(word.start_time.seconds + (word.start_time.nanos || 0) / 1e9)}
            style={{ cursor: 'pointer', marginRight: '4px' }}
          >
            {word.word}
          </span>
        ))}
      </div>
      {/* <p>Full transcription text:</p>
      {transcriptions.map((transcription, index) => (
        <div key={index}>{transcription.transcript}</div>
      ))} */}
    </div>
  );
};

export default TranscriptionViz;