import AWS from 'aws-sdk';
import dotenv from 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION
});

const BUCKET = process.env.AWS_BUCKET;

export const uploadFileAwsService = {

  // יצירת כתובת העלאה חתומה
  createPresignedUploadUrl: async (fileName, contentType) => {
    const uniqueFileName = `${Date.now()}-${uuidv4()}-${fileName}`;
    
    const params = {
      Bucket: BUCKET,
      Key: uniqueFileName,
      Expires: 3600,
      ContentType: contentType, // חובה!
    };

    const url = await s3.getSignedUrlPromise("putObject", params);

    return { 
      url,
      key: uniqueFileName,
      contentType
    };
  },

  // יצירת כתובת הורדה
  createPresignedDownloadUrl: async (fileKey) => {
    console.log("AWS ACCESS:", process.env.AWS_ACCESS_KEY);
    console.log("AWS SECRET:", process.env.AWS_SECRET_KEY);
    console.log("AWS REGION:", process.env.AWS_REGION);
    console.log("AWS BUCKET:", process.env.AWS_BUCKET);

    const params = {
      Bucket: BUCKET,
      Key: fileKey,
      Expires: 3600,
    };

    try {
      const res = await s3.getSignedUrlPromise("getObject", params);
      return res;
    } catch (error) {
      console.error("Error generating download URL:", error);
      throw error;
    }
  }
};
