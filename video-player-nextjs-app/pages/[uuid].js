// pages/video/[uuid].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import DisplayJson from '../components/DisplayJson'; 

const VideoPage = () => {
  const router = useRouter();
  const { uuid } = router.query;
  const [videoUrl, setVideoUrl] = useState('');
  const [jsonUrl, setJsonUrl] = useState({});

  useEffect(() => {
    if (!uuid) return;

    // Fetch API 
    const fetchData = async () => {
      try {
        // Fetch video file uri and json file uri
        const response = await fetch(`/api/video/${uuid}`);
        console.log("searching for video", uuid)
        console.log("response", response)
        const data = await response.json();
        setVideoUrl(data.videoUrl);
        setJsonUrl(data.jsonUrl);
        console.log("fetch data", data)
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, [uuid]);

  return (
    <div>
      {videoUrl && <VideoPlayer src={videoUrl} />}
      {jsonUrl && <DisplayJson jsonUrl={jsonUrl} />}
    </div>
  );
};

export default VideoPage;
