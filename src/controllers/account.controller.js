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
    for (let i = 0; i < selectedArr.length; i++) {
      await User.deleteOne({ email: selectedArr[i] })
        .then((response) => {
          res.status(200).json({ success: "Xoá tài khoản thành công" });
        })
        .catch((error) => {
          res.status(500).json({ error: "Xoá tài khoản thất bại" });
        });
    }
  }
}

module.exports = new AccountController();
