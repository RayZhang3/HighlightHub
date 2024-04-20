import React, { useState, useEffect } from 'react';
import GptGetWord from './GptGetWord';

const TextDetectionViz = ({ jsonData, videoInfo, currentTime, videoRef }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');
  const [analyzedTexts, setAnalyzedTexts] = useState([]);

  const handleSegmentClick = (seconds) => {
    console.log('seconds:', seconds, 'videoRef:', videoRef);
    if (videoRef.current) {
      videoRef.current.seekTo(seconds);
    }
  };

  const handleSearchSubmit = () => {
    setSubmittedSearchTerm(searchTerm.trim());
  };

  useEffect(() => {
    if (!searchTerm) {
      setSubmittedSearchTerm('');
    }
  }, [searchTerm]);

  const getTextTracks = () => {
    return jsonData.annotation_results
      .filter((ar) => 'text_annotations' in ar)
      .flatMap((ar) => ar.text_annotations)
      .map((text) => {
        const startTime = text.segments[0].segment.start_time_offset.seconds;
        const endTime = text.segments[0].segment.end_time_offset.seconds;
        return {
          text: text.text,
          startTime: startTime,
          endTime: endTime,
        };
      });
  };

  const textTracks = getTextTracks();

  const getCurrentTextTracks = () => {
    return textTracks.filter(
      (track) => track.startTime <= currentTime && track.endTime >= currentTime
    );
  };

  const currentTextTracks = getCurrentTextTracks();

  const filteredTextTracks = textTracks.filter((track) =>
    track.text.toLowerCase().includes(submittedSearchTerm.toLowerCase())
  );

  const handleAnalyze = (text) => {
    setAnalyzedTexts((prevAnalyzedTexts) => [...prevAnalyzedTexts, text]);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <p>Detected text on screen at {Math.floor(currentTime)}s:</p>
        {currentTextTracks.map((track, index) => (
          <div key={index}>
            <div>{track.text}</div>
            <button onClick={() => handleSegmentClick(track.startTime)}>
              Jump to {track.startTime}s
            </button>
            <button onClick={() => handleAnalyze(track.text)}>Analyze</button>
            {analyzedTexts.includes(track.text) && (
              <GptGetWord word={track.text} rating={1} />
            )}
          </div>
        ))}
      </div>
      <div>
        <input
          type="text"
          placeholder="Search for text..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
        />
        <button onClick={handleSearchSubmit}>Search</button>
        {submittedSearchTerm && (
          <>
            {filteredTextTracks.length > 0 ? (
              filteredTextTracks.map((track, index) => (
                <div key={index}>
                  <div>{track.text}</div>
                  <button onClick={() => handleSegmentClick(track.startTime)}>
                    Jump to {track.startTime}s
                  </button>
                  <button onClick={() => handleAnalyze(track.text)}>
                    Analyze
                  </button>
                  {analyzedTexts.includes(track.text) && (
                    <GptGetWord word={track.text} rating={1} />
                  )}
                </div>
              ))
            ) : (
              <p>No text matches your search.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TextDetectionViz;