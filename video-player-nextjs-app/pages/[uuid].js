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
  const [rating, setRating] = useState(1);  // State to hold the selected rating



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

  // Handler for changing the rating based on dropdown selection
  const handleRatingChange = (event) => {
    setRating(Number(event.target.value));
    // set the rating state to the selected value
  };

  //function to handle the button click 
  const handleButtonClick = (component) => {
    setActiveComponent(component);
  };


  if (!videoUrl) return <div>Loading...</div>;
  return (
    <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: 'white' // Optional: Adds a cinema-like background
    }}
    >
    <VideoPlayer 
      ref={videoRef} 
      src={videoUrl} 
      onProgress={({ playedSeconds }) => setCurrentTime(playedSeconds)}
      style={{
        maxWidth: '100%',
        maxHeight: '90vh', // Adjust this as needed
        width: 'auto',
        height: 'auto',
        border: 'none' // Ensures no border around the video
      }}
    />

  <label htmlFor="rating-select" style={{
    color: '#45497d', // Same text color as the buttons
    border: '2px solid #45497d',
    padding: '10px 10px', // Similar padding to the buttons
    borderRadius: '10px', // Same border radius as the buttons
    marginRight: '20px', // Remove bottom margin to align on the same line
    fontSize: '20px'
  }}>
    Your Understanding Level
  </label>

  <select id="rating-select" value={rating} onChange={handleRatingChange} style={{
    color: '#45497d', // Text color for the options
    border: '2px solid #45497d',
    borderRadius: '10px', // Rounded corners
    padding: '8px 5px', // Padding for the select box
    width: 'auto', // Default width or adjust as necessary
    marginBottom: '20px',
    marginTop: '20px',
    fontSize: '16px'
  }}>
    {[1, 2, 3, 4, 5].map(option => (
      <option key={option} value={option}>{option}</option>
    ))}
  </select>
  
  <label style={{ color: '#45497d', marginLeft: '20px',
        fontSize: '20px'}}>
    1 - <span style={{ marginRight: '20px' }}>Unfamiliar</span>5 - Expert
  </label>


    <div>
      <button onClick={() => handleButtonClick('TranscriptionViz')}
      style={{ 
        borderRadius: '10px', 
        border: '2px solid #5F6AE6', 
        color: '#5F6AE6', 
        padding: '10px 20px', 
        marginRight: '10px', 
        marginTop: '10px',
        backgroundColor: 'white',
        fontSize: '16px'
       }}
      > Subtitles/Captions </button>
      <button onClick={() => handleButtonClick('TextDetectionViz')}
      style={{ borderRadius: '10px', 
      border: '2px solid #5F6AE6', 
      color: '#5F6AE6', 
      padding: '10px 20px',
      marginRight: '10px',
      backgroundColor: 'white',
      fontSize: '16px' 
    }}
      >Text Detection</button>
      <button onClick={() => handleButtonClick('DisplayJson')} 
      style={{ 
        borderRadius: '10px', 
        border: '2px solid #5F6AE6', 
        color: '#5F6AE6', 
        padding: '10px 20px',
        marginRight: '10px',
        backgroundColor: 'white',
        fontSize: '16px'
      }}
      >Transcripts </button>
    </div>
    {activeComponent === 'TranscriptionViz' && jsonData && <TranscriptionViz jsonData={jsonData} videoInfo={{ frameRate: 30 }} currentTime={currentTime} videoRef={videoRef} rating={rating}/>}
    {activeComponent === 'TextDetectionViz' && jsonData && <TextDetectionViz jsonData={jsonData} videoInfo={{ frameRate: 30 }} currentTime={currentTime} videoRef={videoRef} rating={rating}/>}
    {activeComponent === 'DisplayJson' && jsonData && <DisplayJson jsonData={jsonData} />}
  </div>
);
};

export default VideoPage;
