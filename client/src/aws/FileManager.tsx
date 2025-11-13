// components/FileManager.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface FileItem {
  key: string;
  name: string;
  type: string;
}

interface FileManagerProps {
  files: FileItem[];
}

const FileManager: React.FC<FileManagerProps> = ({ files }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDownload = async (key: string) => {
    try {
      const { data } = await axios.get('http://localhost:3000/api/contracts/download-url', { params: { fileKey: key  } });
      window.open(data.url, '_blank'); // הורדה/פתיחה בכרטיסייה חדשה
    } catch (err) {
      console.error(err);
      alert('שגיאה בהורדה');
    }
  };

  const handlePreview = async (file: FileItem) => {
    if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
      alert('Preview זמין רק לקבצי תמונה או PDF');
      return;
    }

    try {
      const { data } = await axios.get('http://localhost:3000/api/contracts/download-url', { params: { fileKey: file.key } });
      console.log(data);
      
      setPreviewUrl(data.url);
    } catch (err) {
      console.error(err);
      alert('שגיאה בקבלת preview');
    }
  };

  return (
    <div>
      <h3>קבצים</h3>
      <ul>
        {files.map((file) => (
          <li key={file.key} style={{ marginBottom: '10px' }}>
            <span>{file.name}</span>{' '}
            <button onClick={() => handlePreview(file)}>Preview</button>{' '}
            <button onClick={() => handleDownload(file.key)}>Download</button>
          </li>
        ))}
      </ul>

      {previewUrl && (
        <div style={{ marginTop: '20px' }}>
          {previewUrl.endsWith('.pdf') ? (
            <iframe src={previewUrl} width="600" height="400" title="PDF Preview"></iframe>
          ) : (
            <img src={previewUrl} alt="Preview" style={{ maxWidth: '600px', maxHeight: '400px' }} />
          )}
          <div>
            <button onClick={() => setPreviewUrl(null)}>סגור Preview</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;




