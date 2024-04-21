import React, { useState, useEffect } from 'react';
import GptGetWord from './GptGetWord';

const TextDetectionViz = ({ jsonData, videoInfo, currentTime, videoRef, rating }) => {
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
  /*
  const handleAnalyze = (text) => {
    setAnalyzedTexts((prevAnalyzedTexts) => [...prevAnalyzedTexts, text]);
  };
  */
  const handleAnalyze = (text) => {
    // Update the state with the text and the current selected rating
    // This will either overwrite the existing entry with a new rating or create a new one
    setAnalyzedTexts((prevAnalyzedTexts) => ({
      ...prevAnalyzedTexts,
      [text]: rating,
    }));
  };


  return (
    <div 
    // style={{ display: 'flex', justifyContent: 'space-between' }}
    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
    >
      <div
      style={{
        width: '800px',
        // maxWidth: '1000px',
        maxHeight: '400px',
        minHeight: '100px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        border: '2px solid #45497d',
        padding: '10px',
        fontSize: '18px',
        marginTop: '65px'
      }}
      >
        <p>Detected text on screen at {Math.floor(currentTime)}s:</p>
        {currentTextTracks.map((track, index) => (
          <div key={index}>
            <div>{track.text}</div>
            <button onClick={() => handleSegmentClick(track.startTime)}
            style={{
              color: '#45497d', // Text color for the options
              border: '2px solid #45497d',
              borderRadius: '10px', // Rounded corners
              padding: '8px 5px', // Padding for the select box
              width: 'auto', // Default width or adjust as necessary
              marginBottom: '20px',
              marginTop: '20px',
              backgroundColor: 'white',
              fontSize: '16px',
              marginRight: '10px'
            }}
            >
              Jump to {track.startTime}s
            </button>
            <button onClick={() => handleAnalyze(track.text)}
            style={{
              color: '#45497d', // Text color for the options
              border: '2px solid #45497d',
              borderRadius: '10px', // Rounded corners
              padding: '8px 5px', // Padding for the select box
              width: 'auto', // Default width or adjust as necessary
              marginBottom: '20px',
              marginTop: '20px',
              backgroundColor: 'white',
              fontSize: '16px'
            }}
            >Analyze</button>
            {/* 
              Render GptGetWord only if the text is in analyzedTexts and the rating matches.
              This prevents re-rendering if the rating is changed after analysis.
            */}
            {analyzedTexts[track.text] === rating && (
              <GptGetWord word={track.text} rating={rating} />
            )}
          </div>
        ))}
      </div>

      <div
      style={{
        width: '300px',
        // maxWidth: '1000px',
        maxHeight: '400px',
        minHeight: '100px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        border: '2px solid #45497d',
        padding: '10px',
        fontSize: '18px',
        marginTop: '65px',
        marginLeft: '20px'
      }}
      >
        <input
          type="text"
          placeholder="Search for text..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
          style={{
            width: '100%',         
            padding: '8px 12px',   
            margin: '10px 0',       
            boxSizing: 'border-box',
            border: '2px solid #45497d', 
            borderRadius: '4px',    
            outline: 'none',       
            fontSize: '16px',       
            color: '#333',          
            backgroundColor: '#fff', 
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)' 
          }}

        />
        <button onClick={handleSearchSubmit}
        style={{
          color: '#45497d', // Text color for the options
          border: '2px solid #45497d',
          borderRadius: '10px', // Rounded corners
          padding: '8px 5px', // Padding for the select box
          width: 'auto', // Default width or adjust as necessary
          marginBottom: '20px',
          marginTop: '20px',
          backgroundColor: 'white',
          fontSize: '16px'
        }}
        >Search</button>
        {submittedSearchTerm && (
          <>
            {filteredTextTracks.length > 0 ? (
              filteredTextTracks.map((track, index) => (
                <div key={index}>
                  <div>{track.text}</div>
                  <button onClick={() => handleSegmentClick(track.startTime)}
                  style={{
                    color: '#45497d', // Text color for the options
                    border: '2px solid #45497d',
                    borderRadius: '10px', // Rounded corners
                    padding: '8px 5px', // Padding for the select box
                    width: 'auto', // Default width or adjust as necessary
                    marginBottom: '20px',
                    marginTop: '20px',
                    backgroundColor: 'white',
                    fontSize: '16px',
                    marginRight:'20px'
                  }}
                  >
                    Jump to {track.startTime}s
                  </button>
                  <button onClick={() => handleAnalyze(track.text)}
                  style={{
                    color: '#45497d', // Text color for the options
                    border: '2px solid #45497d',
                    borderRadius: '10px', // Rounded corners
                    padding: '8px 5px', // Padding for the select box
                    width: 'auto', // Default width or adjust as necessary
                    marginBottom: '20px',
                    marginTop: '20px',
                    backgroundColor: 'white',
                    fontSize: '16px'
                  }}
                  >
                    Analyze
                  </button>
                  {analyzedTexts.includes(track.text) && (
                    <GptGetWord word={track.text} rating={rating} />
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