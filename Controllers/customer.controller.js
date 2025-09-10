import Customer from "../models/Customer.js";
import { errorHandler } from "../utils/error.js";


export const createCustomer = async (req, res,next) => {
  try {
    const { _id, name, NIC, address, contactNo } = req.body;
    if (!_id || !name || !NIC || !address || !contactNo) {
      return next(errorHandler(400, "All details are required"));
    }

    const newCustomer = new Customer({
      _id,
      name,
      NIC,
      address,
      contactNo,
      createdBy: req.user._id, // link to logged-in user
    });

    await newCustomer.save();

    res.status(201).json({
      success: true,
      message: "Customer created successfully!",
      customer: newCustomer,
    });
  }  catch (error) {
    if (error.name === "ValidationError") {
      // Format errors as { field: message }
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        message: "Validation Error",
        errors: errors,
      });
    }
    next(error);
  }
};




export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ createdBy: req.user._id });


    if (!customers) {
      return next(errorHandler(400, "Customer not found"));
    }
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, NIC, address, contactNo } = req.body;

    // Find customer created by this user
    const customer = await Customer.findOne({
      _id: id,
      createdBy: req.user._id,
    });

    if (!customer) {
      return next(errorHandler(400, "Customer not found or not authorized"));
    }

    // Update only if values are provided, otherwise keep existing
    if (name) customer.name = name;
    if (NIC) customer.NIC = NIC;
    if (address) customer.address = address;
    if (contactNo) customer.contactNo = contactNo;

    await customer.save();

    res
      .status(200)
      .json({ message: "Customer updated successfully", customer });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findOneAndDelete({
      _id: id,
      createdBy: req.user._id,
    });

    if (!customer) {
      return next(errorHandler(404, "Customer not found or not authorized"));
    }

    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

