const jwt = require("jsonwebtoken");

exports.isAdmin = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send({ message: "You are unauthorized." });
  }
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, data) => {
    if (err) {
      return res.status(401).send({ message: "You are unauthorized." });
    }
    if (data.userRole != "admin") {
      return res.status(401).send({ message: "You are not an Admin." });
    }
    req._id = data.userId;
    console.log("admin checked!");
    next();
  });
};
