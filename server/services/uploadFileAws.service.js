import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET = process.env.AWS_BUCKET;
export const uploadFileAwsService = {
//  createPresignedUploadUrl: async (fileName, contentType) => {
//     const params = {
//       Bucket: BUCKET,
//       Key: fileName,
//       Expires: 3600, // 1 שעה
//       ContentType: contentType,
//     };
//     return await s3.getSignedUrlPromise('putObject', params);
//   },
createPresignedUploadUrl: async (fileName, contentType) => {
  const params = {
    Bucket: BUCKET,
    Key: fileName,
    Expires: 3600,
    ContentType: contentType,
  };
  const url = await s3.getSignedUrlPromise('putObject', params);
  return { url, key: fileName }; 
},

  createPresignedDownloadUrl: async (fileKey) => {
    const params = {
      Bucket: BUCKET,
      Key: fileKey,
      Expires: 3600, // 1 שעה
    };
    return await s3.getSignedUrlPromise('getObject', params);
  },
};
