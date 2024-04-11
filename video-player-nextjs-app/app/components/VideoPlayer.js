// app/components/VideoPlayer.js
'use client';

import React, { useRef } from 'react';
import ReactPlayer from 'react-player';

function VideoPlayer() {
  const playerRef = useRef(null);

  const handleSeekChange = (e) => {
    const newPlayed = parseFloat(e.target.value);
    playerRef.current.seekTo(newPlayed, 'fraction');
  };

  return (
    <div>
      <ReactPlayer
        ref={playerRef}
        url="https://highlighthub.s3.amazonaws.com/videos/NORP_Structured_Project.mp4"
        playing
        controls
      />
      <input
        type="range"
        min={0}
        max={1}
        step="any"
        onChange={handleSeekChange}
      />
    </div>
  );
}

export default VideoPlayer;