const User = require("../models/User");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const path = require("path");
const cookieParser = require("cookie-parser");
const { verificationEmail } = require("../utils/emailTemplate");
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
    html: `<p>Please enter the following <strong style="font-weight: bold; color: red;">otp</strong> to reset your password: <strong>${otp}</strong></p>`,
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
      const newUser = new User({ name, email, password, phoneNumber });
      newUser.verificationToken = crypto.randomBytes(20).toString("hex");
      await newUser.save();
      sendVerificationEmail(newUser.email, newUser.verificationToken);

      // Debugging statement to verify data
      console.log("New User Registered:", newUser);
      console.log();
      res.status(200).json({
        message: "Registration successful!",
      });
    } catch (error) {
      console.log("Error during registration:", error); // Debugging statement
      res.status(500).json({ message: "Error during registration" });
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
      res.status(500).json({ message: "Email Verificatioion Failed" });
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
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid password" });
      }

      //generate a token
      if (user.isAuthenticated) {
        var secretKey = process.env.JWT_SECRET_KEY;
        var token = jwt.sign({ userId: user._id, userName: user.name, userRole: user.isAdmin ? "admin" : "client" }, secretKey);
      } else {
        var token = false;
      }
      // var cookieOptions;
      // if (isRemember && token) {
      //   cookieOptions = {
      //     path: "/",
      //     expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      //     httpOnly: true,
      //     sameSite: "lax",
      //   };
      // } else if (token && !isRemember) {
      //   cookieOptions = {
      //     path: "/",
      //     httpOnly: true,
      //     sameSite: "lax",
      //   };
      // }
      // return res.cookie("token", token, cookieOptions)
      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ message: "Login Failed!" });
    }
  },

  updateUserInfo: async (req, res) => {
    try {
      const { userId } = req.params;
      const { isEdit } = req.body;
      const existingUser = await User.findById(userId);
      if (!existingUser) {
        return res.status(404).send({
          status: false,
          message: "User not found",
        });
      }
      if (isEdit) {
        Object.assign(existingUser, req.body);
      } else {
        const { firstName, lastName, phoneNumber, paymentMethod, avatar, address } = req.body;

        Object.assign(existingUser, {
          firstName,
          lastName,
          phoneNumber,
          paymentMethod,
          avatar,
          firstTime: false,
        });
        existingUser.addresses.push(address);
      }
      const updatedUser = await existingUser.save();

      return res.status(201).send({
        status: true,
        message: "User Account Updated Successfully!",
        data: updatedUser,
      });
    } catch (err) {
      return res.status(500).send({
        status: false,
        error: err.message,
      });
    }
  },

  //get the user profile
  getUserProfile: async (req, res) => {
    try {
      const userId = req.params.userId;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving the user profile" });
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
      console.log("otp: ", otp);
      user.otp = otpObj;
      console.log(user);
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
        return res.status(404).json({ message: "This email doesn't exist" });
      }
      if (user.otp.otp != otp) {
        return res.status(405).json({ message: "OTP incorrect!" });
      } else if (user.otp.expireAt < new Date()) {
        user.otp = undefined;
        await user.save();
        return res.status(406).json({ message: "OTP is expired!" });
      }

      passwordToken = crypto.randomBytes(20).toString("hex");
      expireAt = new Date(Date.now() + 5 * 60 * 1000);
      passwordTokenObj = {
        passwordToken,
        expireAt,
      };
      user.passwordToken = passwordTokenObj;
      await user.save();
      // user.otp=undefined,
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
        console.log(token);
        user.password = newPassword;
        user.passwordToken = undefined;
        user.otp = undefined;
        await user.save();
        return res.status(200).json({ message: "Password change successfully!" });
      } else {
        user.otp = undefined;
        user.passwordToken = undefined;
        user.save();
        res.status(405).json({ message: "Reset password token incorrect or expired!" });
      }
    } catch (error) {
      res.status(500).json({
        message: "An error occurs while changing password. Please try again later!",
      });
    }
  },
};
