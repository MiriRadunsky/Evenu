import { getErrorMessage } from "@/Utils/error";
import api from "./axios";
import axios from "axios";

 export const uploadFileToS3 = async (file: File) => {
  try {
    if (!file) throw new Error("No file provided");

    // בקשת כתובת upload מהשרת
    const res = await api.get('/file/upload-url', {
      params: { 
        fileName: file.name, 
        contentType: file.type 
      },
    });

    const { url: presignedUrl, key } = res.data;

    if (!presignedUrl || !key) {
      throw new Error("Invalid presigned response");
    }

    // העלאה ישירה ל-S3
    await axios.put(presignedUrl, file, {
      headers: { "Content-Type": file.type },
    });

    return key; // מחזיר את המפתח לשמירה במסד
  } catch (error: unknown) {
    console.error("S3 Upload Error:", error);
    throw new Error(getErrorMessage(error, "שגיאה בהעלאת הקובץ"));
  }
};


  export const getImageUrl = async (key:string) => {
  const res = await api.get('/file/download-url', { params: { fileKey: key } });
  
  return res.data.url; 
};
