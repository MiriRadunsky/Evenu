import "../models/event.model.js";
import "../models/user.model.js";
import "../models/supplier.model.js";
import Contract from "../models/contract.model.js";

const CONTRACT_POPULATE_SPEC = [
  { path: "eventId", select: "name date" },
  { path: "clientId", select: "name email" },
  {
    path: "clientSignatures.clientId",
    select: "name email",
  },
  {
    path: "supplierSignature.supplierId",
    select: "name email user",
    populate: { path: "user", select: "name email" },
  },
  {
    path: "supplierId",
    populate: { path: "user", select: "name email" },
  },
];
export function contractMatchesSearch(contract, searchTerm) {
  if (!searchTerm) return true;

  const term = String(searchTerm).toLowerCase();

  const eventName = contract.eventId?.name?.toLowerCase?.() || "";
  const clientName = contract.clientId?.name?.toLowerCase?.() || "";
  const supplierName =
    contract.supplierId?.name?.toLowerCase?.() ||
    contract.supplierId?.user?.name?.toLowerCase?.() ||
    "";

  const notes = (contract.paymentPlan || [])
    .map((p) => p.note?.toLowerCase?.() || "")
    .join(" ");

  return (
    eventName.includes(term) ||
    clientName.includes(term) ||
    supplierName.includes(term) ||
    notes.includes(term)
  );
}
export async function createContract(contractData) {
  const contract = await Contract.create(contractData);
  return await populateContractQuery(Contract.findById(contract._id));
}

export async function populateContractDoc(contract) {
  await contract.populate(CONTRACT_POPULATE_SPEC);
  return contract;
}

function populateContractQuery(query) {
  return query.populate(CONTRACT_POPULATE_SPEC);
}

export async function getContractById(id) {
  return populateContractQuery(Contract.findById(id));
}

export async function updateContract(id, updateData) {
  const query = Contract.findByIdAndUpdate(id, updateData, { new: true });
  const updated = await populateContractQuery(query);
  return updated;
}

export async function checkIfContractExists({
  eventId,
  supplierId,
  clientId,
  status,
}) {
  return Contract.findOne({
    eventId,
    supplierId,
    clientId,
    status,
  });
}



export async function getContractsBySupplier(
  supplierId,
  { page = 1, limit = 10, status, eventId, searchTerm } = {}
) {
  const filter = { supplierId };
  if (status) filter.status = status;
  if (eventId) filter.eventId = eventId;

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const docs = await populateContractQuery(
    Contract.find(filter).sort({ createdAt: -1 })
  );

  const filtered = searchTerm
    ? docs.filter((c) => contractMatchesSearch(c, searchTerm))
    : docs;

  const total = filtered.length;
  const pageItems = filtered.slice(skip, skip + limitNumber);

  return {
    items: pageItems,
    total,
    page: pageNumber,
    pageSize: limitNumber,
    totalPages: Math.ceil(total / limitNumber) || 1,
  };
}
export async function getContractsByClient(
  userId,
  { page = 1, limit = 10, status, eventId, searchTerm } = {}
) {
  const filter = { clientId: userId };
  if (status) filter.status = status;
  if (eventId) filter.eventId = eventId;

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const docs = await populateContractQuery(
    Contract.find(filter).sort({ createdAt: -1 })
  );

  const filtered = searchTerm
    ? docs.filter((c) => contractMatchesSearch(c, searchTerm))
    : docs;

  const total = filtered.length;
  const pageItems = filtered.slice(skip, skip + limitNumber);

  return {
    items: pageItems,
    total,
    page: pageNumber,
    pageSize: limitNumber,
    totalPages: Math.ceil(total / limitNumber) || 1,
  };
}
