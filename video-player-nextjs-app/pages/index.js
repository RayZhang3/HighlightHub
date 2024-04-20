// app/page.js
// 'use client';

// import Head from 'next/head';
// import VideoPlayer from '../components/VideoPlayer';
// import UploadForm from '../components/UploadForm';

// export default function Home() {
//   return (
//     <div>
//       <Head>
//         <title>Video Player App</title>
//         <link rel="icon" href="/favicon.ico" />
//       </Head>
//       <main>
//         <div>
//         <h1>Welcome to our Video Player App</h1>
//         </div>
//         <div>
//         <VideoPlayer />
//         </div>
//         <div>
//         <UploadForm />
//         </div>
//       </main>
//     </div>
//   );
// }

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import VideoPlayer from '../components/VideoPlayer'; // 如果你想在首页也使用VideoPlayer
import UploadForm from '../components/UploadForm';
import styles from './HomePage.module.css';

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const defaultImageUrl = 'https://highlighthub.s3.amazonaws.com/image/Logo.png'; // Default image URL

  useEffect(() => {
    const fetchVideos = async () => {
      const response = await fetch('/api/videos');
      console.log('response', String(response))
      const data = await response.json();
      const videosWithThumbnail = data.map(video => ({
        ...video,
        imageUrl: video.imageUrl || defaultImageUrl // if imageUrl is not provided, use defaultImageUrl
      }));
      setVideos(videosWithThumbnail);
    };
    fetchVideos();
  }, []);
  

  return (
    <div className={styles.container}>
      <h1>Video Gallery</h1>
      <UploadForm />  {/* UploadForm组件位置，可根据需要调整 */}
      <div className={styles.videoGrid}>
        {videos.map(video => (
          <Link key={video.id} href={video.url} passHref>
            <div className={styles.videoCard}>
              <img src={video.imageUrl} alt={video.title} className={styles.thumbnail} />
              <h2>{video.title}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
