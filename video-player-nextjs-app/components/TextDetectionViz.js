import React from 'react';

const TextDetectionViz = ({ jsonData, videoInfo, currentTime, videoRef }) => {
  const handleSegmentClick = (seconds) => {
    // if (videoRef.current) {
    //   videoRef.current.seekTo(seconds);
    // }
    console.log('seconds:', seconds, 'videoRef:', videoRef)
    if (videoRef.current) {
      videoRef.current.seekTo(seconds);
    }
  };

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

  return (
    <div>
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
  );
};

export default TextDetectionViz;