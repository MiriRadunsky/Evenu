import React, { useState } from 'react';
import axios from 'axios';

interface FileUploaderProps {
  getPresignedUrlEndpoint: string; // כתובת ה-API שמחזיר Presigned URL
}

const FileUploader: React.FC<FileUploaderProps> = ({ getPresignedUrlEndpoint }) => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setProgress(0);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) return setMessage('בחרי קובץ קודם.');

    try {
      // 1️⃣ בקשה לשרת לקבלת Presigned URL
      const res = await axios.get(getPresignedUrlEndpoint, {
        params: { fileName: file.name, contentType: file.type },
      });
console.log(file.name);

      const presignedUrl = res.data.url;

      // 2️⃣ העלאה ישירה ל-S3 דרך ה-Presigned URL
      await axios.put(presignedUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      });

      setMessage('הקובץ הועלה בהצלחה!');
      setFile(null);
      setProgress(0);
    } catch (err) {
      console.error(err);
      setMessage('שגיאה בהעלאת הקובץ.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', textAlign: 'center' }}>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file} style={{ marginTop: '10px' }}>
        העלה קובץ
      </button>

      {progress > 0 && (
        <div style={{ marginTop: '10px' }}>התקדמות: {progress}%</div>
      )}

      {message && <div style={{ marginTop: '10px' }}>{message}</div>}
    </div>
  );
};

export default FileUploader;
