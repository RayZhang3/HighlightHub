// app/page.js
import Head from 'next/head';
import VideoPlayer from './components/VideoPlayer';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Video Player App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1>Welcome to our Video Player App</h1>
        <VideoPlayer />
      </main>
    </div>
  );
}