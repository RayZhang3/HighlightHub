// components/VideoPlayer.js
import React from 'react';
import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

const VideoPlayer = React.forwardRef(({ src, onProgress }, ref) => {
  const [player, setPlayer] = React.useState(null);

  const seekTo = React.useCallback(
    (seconds) => {
      if (player) {
        player.seekTo(seconds, 'seconds');
      } else {
        console.log('Player instance not available.');
      }
    },
    [player]
  );

  React.useImperativeHandle(ref, () => ({
    seekTo,
  }));

  const handleReady = (player) => {
    setPlayer(player);
  };

  const defaultUrl = "https://highlighthub.s3.amazonaws.com/videos/26901403-a8ac-4109-a138-722722bb8428.mp4";
  const videoUrl = src || defaultUrl;

  return (
    <div>
      <ReactPlayer
        url={videoUrl}
        controls
        playing={false}
        onProgress={onProgress}
        onReady={handleReady}
      />
      <SeekBar player={player} />
    </div>
  );
});

const SeekBar = ({ player }) => {
  const handleSeekChange = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (player) {
      player.seekTo(seekTime, 'seconds');
    } else {
      console.log('Player instance not available.');
    }
  };

  return (
    <input
      type="range"
      min={0}
      max={1}
      step="any"
      onChange={handleSeekChange}
    />
  );
};

export default VideoPlayer;
VideoPlayer.displayName = 'VideoPlayer';