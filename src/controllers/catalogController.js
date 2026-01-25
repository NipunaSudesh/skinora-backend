import Catalogs from "../models/catalogModel.js";


export const addCatalogs = async (req, res) => {
  try {
    const catalog = await Catalogs.create(req.body);
    res.status(201).json(catalog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET Catalogs
export const getCatalogs = async (req, res) => {
  try {
    const catalog = await Catalogs.find();
    res.status(200).json(catalog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
