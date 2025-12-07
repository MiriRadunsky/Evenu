import * as srv from "../services/contract.service.js";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import { uploadFileAwsService } from "../services/uploadFileAws.service.js";

export const createContract = asyncHandler(async (req, res) => {
  const contract = await srv.createContract(req.body, req.user._id);
  res.status(201).json({ message: "Contract created successfully", contract });
});

export const getContract = asyncHandler(async (req, res) => {
  const contract = await srv.getContract(req.params.id);
  res.status(200).json({ contract });
});

export const signContract = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { party, signatureMeta, signatureData } = req.body;

  const updatedContract = await srv.signContractService(
    id,
    req.user,
    party,
    signatureMeta,
    req,
    signatureData
  );

  res.status(200).json({
    message: "Contract signed successfully",
    updatedContract,
  });
});

export const cancelContract = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { party } = req.body;
  const userId = req.user._id;
  const updatedContract = await srv.cancelContractService(id, userId, party);
  res
    .status(201)
    .json({ message: "Contract canceled successfully", updatedContract });
});
export const getContractsBySupplier = asyncHandler(async (req, res) => {
  const { page = 1, limit = 4 ,status, searchTerm } = req.query;

  const result = await srv.getContractsBySupplier(req.user._id, {
    page: Number(page) || 1,
    limit: Number(limit) || 4,
    status: status || undefined,
    searchTerm: searchTerm || undefined,
  });

  res.json(result);
});

export const getContractsByClient = asyncHandler(async (req, res) => {
  const { page = 1, limit = 4, status, eventId, searchTerm } = req.query;

  const result = await srv.getContractsByClient(req.user._id, {
    page: Number(page) || 1,
    limit: Number(limit) || 4,
    status: status || undefined,
    eventId: eventId || undefined,
    searchTerm: searchTerm || undefined,
  });

  res.json(result);
});

export const updateContract = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { s3Key } = req.body;
  const contract = await srv.updateContractService(id, s3Key);
  res.json({ contract });
});

export const verifyContractSignature = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await srv.verifyContractSignatureService(id);
  res.json({
    message: "Contract signature verification complete",
    verification: result,
  });
});

export const getSignatureImage = asyncHandler(async (req, res) => {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ error: "Missing signature key" });
  }

  const url = await uploadFileAwsService.createPresignedDownloadUrl(key);
  res.json({ url });
});
