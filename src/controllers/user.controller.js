const userModel = require("../models/user.model.js");
const User = require("../models/user.model.js");
module.exports = {
  addAddress: async (req, res) => {
    try {
      const userId = req._id;
      const { address } = req.body;
      const user = await User.findOne({ _id: userId });
      if (!user) {
        return res.status(404).json({ message: "This user does not exist" });
      }
      user.addresses.push(address);
      await user.save();
      console.log("success");
      return res.status(200).json({
        message: "Address added successful!",
      });
    } catch (error) {
      return res.status(500).json({
        message: "An error occurs while adding address. Please try again later!",
      });
    }
  },
  getAddress: async (req, res) => {
    try {
      const userId = req._id;
      const user = await User.findOne({ _id: userId });
      if (!user) {
        return res.status(404).json({ message: "This user does not exist" });
      }
      return res.status(200).json({
        message: "Address send successful!",
        addresses: user.addresses,
      });
    } catch (error) {
      return res.status(500).json({
        message: "An error occurs while adding address. Please try again later!",
      });
    }
  },
  deleteAddress: async (req, res) => {
    try {
      const userId = req._id;

      const user = await User.findOne({ _id: userId });
      if (!user) {
        return res.status(404).json({ message: "This user does not exist" });
      }
      const { index } = req.body;
      user.addresses.splice(index, 1);
      await user.save();
      return res.status(200).json({
        message: "Address send successful!",
        addresses: user.addresses,
      });
    } catch (error) {
      return res.status(500).json({
        message: "An error occurs while adding address. Please try again later!",
      });
    }
  },
};
