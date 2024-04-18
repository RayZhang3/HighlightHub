// components/UploadForm.js
import React, { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import styles from './UploadForm.module.css'; // 引入样式

const UploadForm = () => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.error('No file selected.');
      return;
    }
    const originFileName = file.name;
    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const s3filename = `${fileId}.${fileExtension}`;
    // get system full file name
    setUploading(true);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId, s3filename, contentType: file.type , originFileName}),
      });

      const { signedUrl, key } = await response.json();

      const formData = new FormData();
      formData.append('key', key);
      formData.append('Content-Type', file.type);
      formData.append('file', file);

      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload to S3 failed');
      }

      console.log('Upload successful');
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
      <button
        className={styles.button}
        onClick={() => fileInputRef.current.click()}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Upload File'}
      </button>
    </div>
  );
};

export default UploadForm;
UploadForm.displayName = 'UploadForm';
