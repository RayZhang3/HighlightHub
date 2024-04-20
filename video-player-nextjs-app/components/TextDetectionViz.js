import React, { useState, useEffect }  from 'react';

const TextDetectionViz = ({ jsonData, videoInfo, currentTime, videoRef }) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');


  const handleSegmentClick = (seconds) => {
    // if (videoRef.current) {
    //   videoRef.current.seekTo(seconds);
    // }
    console.log('seconds:', seconds, 'videoRef:', videoRef)
    if (videoRef.current) {
      videoRef.current.seekTo(seconds);
    }
  };

  const handleSearchSubmit = () => {
    setSubmittedSearchTerm(searchTerm.trim()); // Use trim to avoid blank searches causing results
  };

  // Automatically hide results when search term is cleared
  useEffect(() => {
    if (!searchTerm) {
      setSubmittedSearchTerm('');
    }
  }, [searchTerm]);


  const getTextTracks = () => {
    return jsonData.annotation_results
      .filter(ar => 'text_annotations' in ar)
      .flatMap(ar => ar.text_annotations)
      .map(text => {
        const startTime = text.segments[0].segment.start_time_offset.seconds;
        const endTime = text.segments[0].segment.end_time_offset.seconds;
        return {
          text: text.text,
          startTime: startTime,
          endTime: endTime
        };
      });
  };

  const textTracks = getTextTracks();

  const getCurrentTextTracks = () => {
    return textTracks.filter(track => 
      track.startTime <= currentTime && track.endTime >= currentTime
    );
  };

  const currentTextTracks = getCurrentTextTracks();

  const filteredTextTracks = textTracks.filter(track =>
    track.text.toLowerCase().includes(submittedSearchTerm.toLowerCase())
  );


//   return (
    // <div>
    //   <p>Detected text on screen at {Math.floor(currentTime)}s:</p>
    //   {currentTextTracks.map((track, index) => (
    //     <div key={index}>
    //       <div>{track.text}</div>
    //       <button onClick={() => handleSegmentClick(track.startTime)}>
    //         Jump to {track.startTime}s
    //       </button>
    //     </div>
    //   ))}
    // </div>
//   );
// };

return (
  <div style={{ display: 'flex', justifyContent: 'space-between' }}> {/* Flex container */}
    <div> {/* First child */}
      <p>Detected text on screen at {Math.floor(currentTime)}s:</p>
      {currentTextTracks.map((track, index) => (
        <div key={index}>
          <div>{track.text}</div>
          <button onClick={() => handleSegmentClick(track.startTime)}>
            Jump to {track.startTime}s
          </button>
        </div>
      ))}
    </div>
  
    <div> {/* Second child for search functionality */}
      <input
        type="text"
        placeholder="Search for text..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
      />
      <button onClick={handleSearchSubmit}>Search</button>
      {submittedSearchTerm && ( // Only render this block if a search term has been submitted
        filteredTextTracks.length > 0 ? (
          filteredTextTracks.map((track, index) => (
            <div key={index}>
              <div>{track.text}</div>
              <button onClick={() => handleSegmentClick(track.startTime)}>
                Jump to {track.startTime}s
              </button>
            </div>
          ))
        ) : (
          <p>No text matches your search.</p> // Display this only if the search term finds no matches
        )
      )}
    </div>
  </div>
);
};


export default TextDetectionViz;