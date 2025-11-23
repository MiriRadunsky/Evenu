import { uploadFileAwsService } from '../services/uploadFileAws.service.js';
export const uploadFileAwsController = {
  getUploadUrl :async (req, res) => {
  const { fileName, contentType } = req.query;
  try {
    const urlData = await uploadFileAwsService.createPresignedUploadUrl(fileName, contentType);
res.json(urlData); // { url: "...", key: "contracts/abc.pdf" }

    // const url = await uploadFileAwsService.createPresignedUploadUrl(fileName, contentType);
    // res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
},

  getDownloadUrl : async (req, res) => {
  const { fileKey } = req.query;
  console.log("fileKey",fileKey);
  try {
    const url = await uploadFileAwsService.createPresignedDownloadUrl(fileKey);
    console.log(url);
    
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
};