if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const port = 3000;
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const User = require("./models/user");
const LocalStrategy = require("passport-local").Strategy;
const registerService = require("./register-service");
const MongoStore = require("connect-mongo");
const expressLayouts = require("express-ejs-layouts");

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Mongodb"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
  })
);
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

const authenticateUser = async (username, password, done) => {
  User.findOne({ username: username })
    .then((user) => {
      if (!user)
        return done(null, false, {
          message: "No users registered with that email!",
        });
      if (bcrypt.compareSync(password, user.password)) return done(null, user);
      else return done(null, false, { message: "Incorrect password!" });
    })
    .catch((err) => {
      done(err);
    });
};
const strategy = new LocalStrategy(authenticateUser);
passport.use(strategy);
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((userId, done) => {
  User.findById(userId)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => done(err));
});

//////
////// ROUTES
//////

app.get("/", checkAuthenticated, (req, res) => res.render("index"));

app.get("/login", checkNotAuthenticated, (req, res) => res.render("login"));

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/organizations",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/register", checkNotAuthenticated, (req, res) =>
  res.render("register")
);

app.post("/register", checkNotAuthenticated, registerService);

app.delete("/logout", (req, res) => {
  req.logOut(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/update-password", checkAuthenticated, (req, res) =>
  res.render("update-password")
);

app.post("/update-password", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (user) {
      user.password = bcrypt.hashSync(
        req.body.password,
        bcrypt.genSaltSync(10)
      );
      user.save();
      return res.redirect("/profile");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal Server Error");
  }
});

app.post("/update-name", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (user) {
      user.name = req.body.name;
      user.save();
      return res.redirect("/profile");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal Server Error");
  }
});

app.post("/update-phone", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (user) {
      user.phone = req.body.phone;
      user.save();
      return res.redirect("/profile");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal Server Error");
  }
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/organizations");
  }
  next();
}

app.get("/organizations", checkAuthenticated, function (req, res) {
  res.render("organizations", { layout: "layouts/dashboard", user: req.user });
});

app.get("/management", checkAuthenticated, function (req, res) {
  res.render("management", { layout: "layouts/dashboard", user: req.user });
});

app.get("/notifications", checkAuthenticated, function (req, res) {
  res.render("notifications", { layout: "layouts/dashboard", user: req.user });
});

app.get("/reports", checkAuthenticated, function (req, res) {
  res.render("reports", { layout: "layouts/dashboard", user: req.user });
});

app.get("/profile", checkAuthenticated, function (req, res) {
  res.render("profile", { layout: "layouts/dashboard", user: req.user });
});

app.get("/subscription", checkAuthenticated, function (req, res) {
  res.render("subscription", { layout: "layouts/dashboard", user: req.user });
});

app.listen(port, () => console.log(`Server started on port ${port}!`));
