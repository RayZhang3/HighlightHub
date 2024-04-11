// app/components/VideoPlayer.js
import React, { useRef } from 'react';
import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const VideoPlayer = React.forwardRef((props, ref) => {
  const handleSeekChange = (e) => {
    const newPlayed = parseFloat(e.target.value);
    ref.current.seekTo(newPlayed, 'fraction');
  };

  return (
    <div>
      <ReactPlayer
        ref={ref}
        url="https://highlighthub.s3.amazonaws.com/videos/NORP_Structured_Project.mp4"
        controls
        playing={false}
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
});

export default VideoPlayer;