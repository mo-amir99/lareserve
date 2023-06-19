const mongoose = require("mongoose");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const sendEmail = require("./send-email");
const Token = require("./models/token");
const crypto = require("crypto");

module.exports = async (req, res) => {
  const userName = req.body.username.toLowerCase();
  try {
    const ifExists = await User.findOne({ username: userName });
    if (ifExists)
      return res.render("register", {
        errorMessage: "Username already exists",
      });
    if (userName.length < 5)
      return res.render("register", {
        errorMessage: "Enter a valid email address",
      });
    if (req.body.password.length < 8)
      return res.render("register", {
        errorMessage: "Password must be at least 8 characters",
      });
    const user = new User({
      name: req.body.name,
      phone: req.body.phone,
      username: userName,
      password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
    });
    let token = await new Token({
      user: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();
    await user.save();
    const message = `Click this link to verify your email ${process.env.BASE_URL}/verify/${user.id}/${token.token}`;
    await sendEmail(user.username, "Verify Email", message);
    return res.render("login");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal Server Error");
  }
};
