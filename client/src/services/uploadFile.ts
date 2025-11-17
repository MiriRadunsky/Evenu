import api from "./axios";
import axios from "axios";
export const uploadFileToS3 = async (file: File) => {
    const res = await api.get('/file/upload-url', {
      params: { fileName: file.name, contentType: file.type },
    });

    const presignedUrl = res.data.url;

    await axios.put(presignedUrl, file, {
      headers: { "Content-Type": file.type },
    });

    return presignedUrl.split("?")[0]; 
  };

  export const getImageUrl = async (key:string) => {
  const res = await api.get('/file/download-url', { params: { fileKey: key } });
  console.log(res);
  
  return res.data.url; // כתובת זמנית לצפייה
};
