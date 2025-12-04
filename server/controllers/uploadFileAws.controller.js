import { uploadFileAwsService } from '../services/uploadFileAws.service.js';

export const uploadFileAwsController = {

  // ----------- UPLOAD -----------
  getUploadUrl: async (req, res) => {
    try {
      const { fileName, contentType } = req.query;

      if (!fileName || !contentType) {
        return res.status(400).json({ error: "Missing fileName or contentType" });
      }

      const urlData = await uploadFileAwsService.createPresignedUploadUrl(
        fileName,
        contentType
      );

      return res.json(urlData); 
      // יחזיר: { url: "...", key: "contracts/abc.pdf" }
    } catch (err) {
      console.error("AWS Upload URL Error:", err);
      return res.status(500).json({ error: "Failed to generate upload URL" });
    }
  },

  // ----------- DOWNLOAD -----------
  getDownloadUrl: async (req, res) => {
    try {
      const { fileKey } = req.query;

      if (!fileKey) {
        return res.status(400).json({ error: "Missing fileKey" });
      }

      const url = await uploadFileAwsService.createPresignedDownloadUrl(fileKey);

      return res.json({ url });
    } catch (err) {
      console.error("AWS Download URL Error:", err);
      return res.status(500).json({ error: "Failed to generate download URL" });
    }
  }

};
