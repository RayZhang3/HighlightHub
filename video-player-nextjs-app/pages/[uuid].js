// pages/video/[uuid].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import VideoPlayer from '../components/VideoPlayer';
import DisplayJson from '../components/DisplayJson'; 

const VideoPage = () => {
  const router = useRouter();
  const { uuid } = router.query;
  const [videoUrl, setVideoUrl] = useState('');
  const [jsonUrl, setJsonUrl] = useState('');
  const [jsonData, setJsonData] = useState(null);

  useEffect(() => {
    if (!uuid) return;

    // Fetch API 
    const fetchData = async () => {
      try {
        // Fetch video file uri and json file uri based on uuid
        const response = await fetch(`/api/video/${uuid}`);
        const data = await response.json();
        setVideoUrl(data.videoUrl);
        setJsonUrl(data.jsonUrl);
        
        // Fetch JSON data if a jsonUrl is provided
        if (data.jsonUrl) {
          const jsonResponse = await fetch(data.jsonUrl);
          const jsonData = await jsonResponse.json();
          setJsonData(jsonData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, [uuid]); // Dependency on uuid ensures this effect runs only when uuid changes

  return (
    <div>
      {videoUrl && <VideoPlayer src={videoUrl} />}
      {jsonData && <DisplayJson jsonData={jsonData} />}
    </div>
  );
};

export default VideoPage;
