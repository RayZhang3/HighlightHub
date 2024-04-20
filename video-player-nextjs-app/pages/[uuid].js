// pages/video/[uuid].js
import { useRouter } from 'next/router';
import { useEffect, useState, useRef} from 'react';
import VideoPlayer from '../components/VideoPlayer';
import DisplayJson from '../components/DisplayJson'; 
import GptResponseDisplay from '../components/GptResponseDisplay'; 
import TextDetectionViz from '../components/TextDetectionViz'; // Assuming this component is stored in components folder
import TranscriptionViz from '../components/TranscriptionViz';


const VideoPage = () => {
  const router = useRouter();
  const { uuid } = router.query;
  const videoRef = useRef();
  const [videoUrl, setVideoUrl] = useState('');
  const [jsonUrl, setJsonUrl] = useState('');
  const [jsonData, setJsonData] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeComponent, setActiveComponent] = useState(''); //define the activeComponent state

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


  //function to handle the button click 
  const handleButtonClick = (component) => {
    setActiveComponent(component);
  };


  if (!videoUrl) return <div>Loading...</div>;
  return (
    // <div>
    //   <VideoPlayer ref={videoRef} src={videoUrl} onProgress={({ playedSeconds }) => setCurrentTime(playedSeconds)} />
    //   {jsonData && <TranscriptionViz jsonData={jsonData} videoInfo={{ frameRate: 30 }} currentTime={currentTime} videoRef={videoRef} />}
    //   {jsonData && <TextDetectionViz jsonData={jsonData} videoInfo={{ frameRate: 30 }} currentTime={currentTime} videoRef={videoRef} />}
    //   {jsonData && <DisplayJson jsonData={jsonData} />}
    // </div>

    <div>
    <VideoPlayer ref={videoRef} src={videoUrl} onProgress={({ playedSeconds }) => setCurrentTime(playedSeconds)} />
    <div>
      <button onClick={() => handleButtonClick('TranscriptionViz')}>Current Transcription time </button>
      <button onClick={() => handleButtonClick('TextDetectionViz')}>Text Detection</button>
      <button onClick={() => handleButtonClick('DisplayJson')}>Transcripts and Summarization </button>
    </div>
    {activeComponent === 'TranscriptionViz' && jsonData && <TranscriptionViz jsonData={jsonData} videoInfo={{ frameRate: 30 }} currentTime={currentTime} videoRef={videoRef} />}
    {activeComponent === 'TextDetectionViz' && jsonData && <TextDetectionViz jsonData={jsonData} videoInfo={{ frameRate: 30 }} currentTime={currentTime} videoRef={videoRef} />}
    {activeComponent === 'DisplayJson' && jsonData && <DisplayJson jsonData={jsonData} />}
  </div>
);
};

export default VideoPage;
