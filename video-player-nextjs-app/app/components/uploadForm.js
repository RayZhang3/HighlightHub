// components/UploadForm.js
import React, { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const UploadForm = () => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.error('No file selected.');
      return;
    }

    // Generate unique file name
    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const filename = `${fileId}.${fileExtension}`;

    // Start uploading process
    setUploading(true);

    try {
      // Get presigned URL from your API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename, contentType: file.type }),
      });

      const { signedUrl, key } = await response.json();

      // Create a FormData to send the file
      const formData = new FormData();
      formData.append('key', key);
      formData.append('Content-Type', file.type);
      formData.append('file', file);

      // Use the presigned URL to upload the file
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload to S3 failed');
      }

      // Perform actions after successful upload
      console.log('Upload successful');
      // TODO: Add any additional logic or state updates
    } catch (error) {
      console.error('Uploading failed', error);
    }

    setUploading(false);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button onClick={() => fileInputRef.current.click()}>
        {uploading ? 'Uploading...' : 'Upload File'}
      </button>
    </div>
  );
};

export default UploadForm;