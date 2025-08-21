import Item from "../models/Item.js";
import { errorHandler } from "../utils/error.js";



export const createItem = async (req, res,next) => {
  try {
    const { _id, name, price, quantity } = req.body;


        if (!_id || !name || !price || !quantity) {
          return next(errorHandler(400, "All details are required"));
        }


    // Prevent duplicate IDs
    const existing = await Item.findById(_id);
    if (existing)
        return next(errorHandler(400, "Item ID already exists"));

    const item = new Item({
      _id,
      name,
      price,
      quantity,
      createdBy: req.user._id, // from JWT auth middleware
    });

    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getItems = async (req, res, next) => {
  try {
    const items = await Item.find({ createdBy: req.user._id });

    if (!items || items.length === 0) {
      return next(errorHandler(404, "No items found for this user"));
    }

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

}


export const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, quantity } = req.body;

    // Find item created by logged-in user
    const item = await Item.findOne({
      _id: id,
      createdBy: req.user._id,
    });

    if (!item) {
      return next(errorHandler(404, "Item not found or not authorized"));
    }

    // Update fields only if values are provided
    if (name) item.name = name;
      if (price) item.price = price;
    if (quantity) item.quantity = quantity;

    await item.save();

    res.status(200).json({ message: "Item updated successfully", item });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};




export const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await Item.findOneAndDelete({
      _id: id,
      createdBy: req.user._id,
    });

    if (!item) {
      return next(errorHandler(404, "Item not found or not authorized"));
    }

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


