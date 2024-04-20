const ContactInfo = require("../models/contactinfo.model");

class ContactController {
  async store(req, res, next) {
    const contactInfo = new ContactInfo(req.body);
    contactInfo
      .save()
      .then((response) => {
        console.log(response);
        res.status(200).json({ success: "Lưu thông tin thành công" });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ error: "Lưu thông tin không thành công" });
      });
  }
}

module.exports = new ContactController();
