const User = require("../models/user.model");

class AccountController {
  async index(req, res, next) {
    try {
      const accounts = await User.find({});
      res.json(accounts);
    } catch (err) {
      console.error("Lỗi khi truy xuất  tài khoản:", err);
      return next(err);
    }
  }
  async delete(req, res, next) {
    const { email } = req.params;
    User.deleteOne({ email: email }).then((response) => {
      res.status(200).json({ success: "Xoá tài khoản thành công" });
    });
  }
  async searchAccount(req, res, next) {
    try {
      const accounts = await User.aggregate([
        [
          {
            $search: {
              index: "accounts",
              text: {
                query: req.params.keyword,
                path: {
                  wildcard: "*",
                },
              },
            },
          },
        ],
      ]);
      res.status(200).json(accounts);
    } catch (error) {
      res.status(500).json("failed to get the accounts");
    }
  }
  async deleteSelectedAccounts(req, res, next) {
    const selectedArr = req.body;
    const deletionPromises = selectedArr.map((email) => {
      return User.deleteOne({ email });
    });
    try {
      await Promise.all(deletionPromises);
      res.status(200).json({ success: "Xoá tài khoản thành công" });
    } catch (error) {
      res.status(500).json({ error: "Xoá tài khoản thất bại" });
    }
  }
  async changeRole(req, res) {
    try {
      const { userId, role } = req.body;
      const user = await User.findOne({ _id: userId });
      if (!user) {
        return res.status(404).json({ message: "This user does not exist" });
      }
      if (role === "admin") {
        user.isAdmin = true;
      } else {
        user.isAdmin = false;
      }
      await user.save();
      return res.status(200).json({
        message: "Role change successful!",
      });
    } catch (error) {
      return res.status(500).json({
        message: "An error occurs while adding address. Please try again later!",
      });
    }
  }
}

module.exports = new AccountController();
