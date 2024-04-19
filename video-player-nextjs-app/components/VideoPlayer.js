// components/VideoPlayer.js
import React from 'react';
import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

const VideoPlayer = React.forwardRef(({ src, onProgress }, ref) => {
  const playerRef = React.useRef(null); // Internal ref to handle player methods

  React.useImperativeHandle(ref, () => ({
    seekTo: (seconds) => {
      if (playerRef.current) {
        playerRef.current.seekTo(seconds);
      }
    }
  }));

  const defaultUrl = "https://highlighthub.s3.amazonaws.com/videos/26901403-a8ac-4109-a138-722722bb8428.mp4";
  const videoUrl = src || defaultUrl;

  return (
    <div>
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        controls
        playing={false}
        onProgress={onProgress}
      />
      <input
        type="range"
        min={0}
        max={1}
        step="any"
        onChange={(e) => playerRef.current.seekTo(seconds)}
      />
    </div>
  );
});

export default VideoPlayer;

VideoPlayer.displayName = 'VideoPlayer';