const mongoose = require("mongoose");
const User = require("./models/user");
const bcrypt = require("bcrypt");
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
    await user.save();
    return res.redirect("/login");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal Server Error");
  }
};
