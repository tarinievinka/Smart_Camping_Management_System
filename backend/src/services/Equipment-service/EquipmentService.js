const Equipment = require('../../models/Equipment-model/EquipmentModel');

const createEquipment = async (data) => {
  const equipment = new Equipment(data);
  return await equipment.save();
};

const getAllEquipment = async () => {
  return await Equipment.find();
};

const getEquipmentById = async (id) => {
  return await Equipment.findById(id);
};

const updateEquipment = async (id, data) => {
  return await Equipment.findByIdAndUpdate(id, data, { new: true });
};

const deleteEquipment = async (id) => {
  return await Equipment.findByIdAndDelete(id);
};

const updateAvailabilityStatus = async (id, status) => {
  const equipment = await Equipment.findById(id);
  if (!equipment) return null;
  equipment.availabilityStatus = status;
  await equipment.save();
  return equipment;
};

module.exports = {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  updateAvailabilityStatus
};