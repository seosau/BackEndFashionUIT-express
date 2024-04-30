const User = require("../models/user.model.js");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const path = require("path");
const bcrypt = require("bcryptjs");

const { verificationEmail, otpEmail } = require("../utils/emailTemplate");

const sendVerificationEmail = async (email, verificationToken) => {
  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
    // Configure the email service or SMTP details here
    service: "gmail",
    auth: {
      user: "sendfromtruonghs@gmail.com",
      pass: "cmgmhgmfkqxglddr",
    },
  });
  // Compose the email message
  const mailOptions = {
    from: "BeanFashion.com",
    to: email,
    subject: "Email Verification",
    html: verificationEmail(verificationToken),
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};
const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    // Configure the email service or SMTP details here
    service: "gmail",
    auth: {
      user: "sendfromtruonghs@gmail.com",
      pass: "cmgmhgmfkqxglddr",
    },
  });
  // Compose the email message
  const mailOptions = {
    from: "amazon.com",
    to: email,
    subject: "Email Verification",
    html: otpEmail(otp),
  };
  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully");
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};

module.exports = {
  regitation: async (req, res) => {
    try {
      const { name, email, password, phoneNumber } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        // Debugging statement
        console.log("Email already registered:", email);
        return res.status(400).json({ message: "Email already registered" });
      }
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new User({ name, email, password: hashedPassword, phoneNumber });
      newUser.verificationToken = crypto.randomBytes(20).toString("hex");
      await newUser.save();
      sendVerificationEmail(newUser.email, newUser.verificationToken);

      // Debugging statement to verify data
      console.log("New User Registered:", newUser);
      console.log();
      return res.status(200).json({
        message: "Registration successful!",
      });
    } catch (error) {
      console.log("Error during registration:", error); // Debugging statement
      return res.status(500).json({ message: "Error during registration" });
    }
  },
  //endpoint to verify the email
  verifyToken: async (req, res) => {
    try {
      const token = req.params.token;
      //Find the user witht the given verification token
      const user = await User.findOne({ verificationToken: token });
      if (!user) {
        return res.status(404).json({ message: "Invalid verification token" });
      }

      //Mark the user as verified
      user.isAuthenticated = true;
      user.verificationToken = undefined;

      await user.save();

      return res.sendFile(path.join(__dirname, "../../public", "registationSuccess.html"));
    } catch (error) {
      return res.status(500).json({ message: "Email Verificatioion Failed" });
    }
  },

  //endpoint to login the user!
  login: async (req, res) => {
    try {
      const { email, password, isRemember } = req.body;
      //check if the user exists
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: "Invalid email" });
      }

      //check if the password is correct
      const passwordMatched = await bcrypt.compare(password, user.password);
      if (!passwordMatched) {
        return res.status(401).json({ message: "Invalid password" });
      }

      //generate a token
      if (user.isAuthenticated) {
        var secretKey = process.env.JWT_SECRET_KEY;
        var token = jwt.sign({ userId: user._id, userName: user.name, email: user.email, userRole: user.isAdmin ? "admin" : "client" }, secretKey);
      } else {
        var token = false;
      }
      var cookieOptions;
      if (isRemember && token) {
        cookieOptions = {
          path: "/",
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          httpOnly: true,
          sameSite: "lax",
        };
      } else if (token && !isRemember) {
        cookieOptions = {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
        };
      }
      res.cookie("token", token, cookieOptions);
      return res.status(200).json({ token });
    } catch (error) {
      return res.status(500).json({ message: "Login Failed!" });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("token");
      return res.status(200).json({ message: "Cookie Removed!" });
    } catch (error) {
      return res.status(500).json({ message: "Log out Failed!" });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "This email doesn't exist" });
      }
      const otp = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
      const expireAt = new Date(Date.now() + 5 * 60 * 1000);
      const otpObj = {
        otp,
        expireAt,
      };
      user.otp = otpObj;
      await user.save();
      sendOTPEmail(email, otp);
      res.status(200).json({ message: "An email has been sent!" });
    } catch (error) {
      res.status(500).json({
        message: "An error occurs while sending the email. Please try again later!",
      });
    }
  },
  giveOTP: async (req, res) => {
    try {
      const { email, otp } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ type: "email", message: "This email doesn't exist" });
      }
      if (user.otp.otp != otp) {
        return res.status(404).json({ type: "otp", message: "OTP incorrect!" });
      } else if (user.otp.expireAt < new Date()) {
        user.otp = undefined;
        await user.save();
        return res.status(403).json({ message: "OTP is expired!" });
      }
      passwordToken = crypto.randomBytes(20).toString("hex");
      expireAt = new Date(Date.now() + 5 * 60 * 1000);
      passwordTokenObj = {
        passwordToken,
        expireAt,
      };
      user.passwordToken = passwordTokenObj;
      await user.save();
      res.status(200).json({ token: user.passwordToken.passwordToken });
    } catch (error) {
      res.status(500).json({
        message: "An error occurs while verifying OTP. Please try again later!",
      });
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { email, newPassword, token } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        res.status(404).json({ message: "This email does not exist" });
      }
      if (user.passwordToken.passwordToken == token || user.passwordToken.expireAt >= new Date()) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        user.passwordToken = undefined;
        user.otp = undefined;
        await user.save();
        return res.status(200).json({ message: "Password change successfully!" });
      } else {
        user.otp = undefined;
        user.passwordToken = undefined;
        user.save();
        res.status(403).json({ message: "Reset password token incorrect or expired!" });
      }
    } catch (error) {
      res.status(500).json({
        message: "An error occurs while changing password. Please try again later!",
      });
    }
  },
  changePassword: async (req, res) => {
    try {
      console.log(req._id);
      const { oldPassword, newPassword } = req.body;
      const user = await User.findOne({ _id: req._id });
      if (!user) {
        res.status(404).json({ message: "This email does not exist" });
      }
      const passwordMatched = await bcrypt.compare(oldPassword, user.password);
      if (passwordMatched) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({ message: "Password change successfully!" });
      } else {
        res.status(403).json({ message: "Old password token incorrect!" });
      }
    } catch (error) {
      res.status(500).json({
        message: "An error occurs while changing password. Please try again later!",
      });
    }
  },
  checkAuth: async (req, res) => {
    try {
      const token = req.cookies.token;
      console.log(token);
      if (!token) {
        return res.status(200).send({ isAuth: false, message: "You are unauthorized." });
      }
      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, data) => {
        if (err) {
          return res.status(200).send({ isAuth: false, message: "You are unauthorized." });
        }
        decodedToken = jwt.decode(token);
        return res.status(200).send({ isAuth: true, decodedToken, message: "You are authorized." });
      });
    } catch (error) {
      res.status(500).json({
        message: "An error occurs while checking. Please try again later!",
      });
    }
  },
};
