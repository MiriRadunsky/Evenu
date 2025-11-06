const asyncHandler = require('../middlewares/asyncHandler');
const svc = require('../services/supplier.service');

// query params: category, region, active, q, page, limit
exports.getAll = asyncHandler(async (req, res) => {
  const data = await svc.listSuppliers(req.query);
  res.json(data);
});

exports.getOne = asyncHandler(async (req, res) => {
  const data = await svc.getSupplier(req.params.id);
  res.json({ supplier: data });
});


asyncHandler(async function updateSupplierStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await svc.updateSupplierStatus(id, status);
    res.json(updated);
});


module.exports = { getAll, getOne, updateSupplierStatus };