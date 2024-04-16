// components/DisplayJson.js
import React, { useEffect, useState } from 'react';
import TranscriptionsDisplay from './TranscriptionsDisplay';
const DisplayJson = ({ jsonUrl }) => {
  const [jsonData, setJsonData] = useState({});

  useEffect(() => {
    const fetchJsonData = async () => {
      try {
        const response = await fetch(jsonUrl);
        const data = await response.json();
        setJsonData(data);
      } catch (error) {
        console.error('Error fetching JSON:', error);
      }
    };

    if (jsonUrl) {
      fetchJsonData();
    }
  }, [jsonUrl]);

  return (
    // <pre>{JSON.stringify(jsonData, null, 2)}</pre>
    <TranscriptionsDisplay jsonData={jsonData} />
  );
};

export default DisplayJson;
