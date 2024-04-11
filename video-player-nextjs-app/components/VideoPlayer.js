// components/VideoPlayer.js
import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';

function VideoPlayer() {
  const [played, setPlayed] = useState(0);
  const playerRef = useRef(null);

  const handleSeekChange = (e) => {
    const newPlayed = parseFloat(e.target.value);
    playerRef.current.seekTo(newPlayed, 'fraction');
    setPlayed(newPlayed);
  };

  const handleProgress = (progress) => {
    setPlayed(progress.played);
  };

  return (
    <div>
      <ReactPlayer
        ref={playerRef}
        url="https://highlighthub.s3.amazonaws.com/videos/NORP_Structured_Project.mp4"
        playing
        controls
        progressInterval={1000}
        onProgress={handleProgress}
      />
      <input
        type="range"
        min={0}
        max={1}
        step="any"
        value={played}
        onChange={handleSeekChange}
      />
    </div>
  );
}

export default VideoPlayer;
