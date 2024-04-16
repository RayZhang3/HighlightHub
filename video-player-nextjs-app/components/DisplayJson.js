// components/DisplayJson.js
import TranscriptionsDisplay from './TranscriptionsDisplay';
const DisplayJson = ({ jsonData }) => {
  return (
    // <pre>{JSON.stringify(jsonData, null, 2)}</pre>
    <TranscriptionsDisplay jsonData={jsonData} />
  );
};

export default DisplayJson;
