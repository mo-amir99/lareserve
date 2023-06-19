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
const Organization = require("./models/organization");
const Chamber = require("./models/chamber");
const Reservation = require("./models/reservation");
const LocalStrategy = require("passport-local").Strategy;
const registerService = require("./register-service");
const MongoStore = require("connect-mongo");
const expressLayouts = require("express-ejs-layouts");
const nodemailer = require("nodemailer");
const sendEmail = require("./send-email");
const ResetToken = require("./models/reset-token");
const Token = require("./models/token");
const crypto = require("crypto");

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Mongodb"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE_URL,
      clear_interval: 3600,
    }),
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

app.post("/remove-user", async (req, res) => {
  const organization = await Organization.findOne({
    _id: req.body.orgId,
  });
  if (organization) {
    const chamber = organization.chambers.find(
      (chamber) => chamber._id == req.body.chamberId
    );
    if (chamber) {
      const reservation = chamber.reservations.find(
        (reservation) => reservation._id == req.body.selectedDate
      );
      if (reservation) {
        if (req.body.members.split("@").length - 1 > 1) {
          reservation.members = [];
        } else {
          reservation.members = reservation.members.filter(
            (member) => member != req.body.members
          );
        }
        if (reservation.members.length == 0) {
          chamber.reservations.splice(
            chamber.reservations.findIndex(
              (reservation) => reservation._id == req.body.selectedDate
            ),
            1
          );
          organization.chambers.splice(
            organization.chambers.findIndex(
              (chamber) => chamber._id == req.body.chamberId
            ),
            1
          );
          organization.chambers.push(chamber);
        } else {
          chamber.reservations.splice(
            chamber.reservations.findIndex(
              (reservation) => reservation._id == req.body.selectedDate
            ),
            1
          );
          chamber.reservations.push(reservation);
          organization.chambers.splice(
            organization.chambers.findIndex(
              (chamber) => chamber._id == req.body.chamberId
            ),
            1
          );
          organization.chambers.push(chamber);
        }
      }
    }
  }
  await organization.save();
  var transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "lareserveproject@gmail.com",
      pass: "cfzmkqfdjntfpuyw",
    },
  });
  var mailOptions = {
    from: "lareserveproject@gmail.com",
    to: req.body.members,
    subject: "La Reserve Reservation",
    text: "This email is to inform you that your reservation has been cancelled.",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return res.status(500).json(error);
    } else {
      return res.send(
        "<h1>User removed and email sent successfully</h1> <a href='/report'>Go Back</a>"
      );
    }
  });
});

app.post("/send-email", (req, res) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "lareserveproject@gmail.com",
      pass: "cfzmkqfdjntfpuyw",
    },
  });
  var mailOptions = {
    from: "lareserveproject@gmail.com",
    to: req.body.members,
    subject: "La Reserve Reservation",
    text:
      "This email is to inform you that you have been added to a reservation by " +
      req.body.orgId +
      " on " +
      req.body.selectedDate +
      " at " +
      req.body.chamberId,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return res.status(500).json(error);
    } else {
      return res.send(
        "<h1>Email sent successfully</h1> <a href='/report'>Go Back</a>"
      );
    }
  });
});

app.get("/", checkNotAuthenticated, (req, res) => res.render("index"));

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

app.post("/delete-organization", async (req, res) => {
  const organization = await Organization.findOne({ _id: req.body.orgId });
  if (organization) {
    // for (let i = 0; i < organization.chambers.length; i++) {
    //   await Chamber.deleteOne({ _id: organization.chambers[i] });
    // }
    const user = await User.findOne({ username: req.user.username });
    if (user) {
      await user.organizations.pull(organization._id);
      await user.save();
    } else {
      return res.status(500).json("Internal Server Error");
    }
    await organization.deleteOne();
    return res.redirect("/organizations");
  } else {
    return res.status(500).json("Internal Server Error");
  }
});

app.post("/delete-chamber", async (req, res) => {
  const organization = await Organization.findOne({ _id: req.body.orgId });
  if (organization) {
    const chamber = organization.chambers.find(
      (chamber) => chamber._id == req.body.chamberId
    );
    if (chamber) {
      organization.chambers.pull(chamber);
      organization.save();
    } else {
      return res.status(500).json("Internal Server Error");
    }
    return res.redirect("/management");
  } else {
    return res.status(500).json("Internal Server Error");
  }
});

app.post("/add-chamber", async (req, res) => {
  const organization = await Organization.findOne({
    _id: req.body.organizationId,
  });
  if (organization) {
    const chamber = new Chamber({
      name: req.body.name,
      reservation: [],
      maxCapacity: req.body.capacity,
    });
    organization.chambers.push(chamber);
    await organization.save();
    return res.redirect("/management");
  } else {
    return res.status(500).json("Internal Server Error");
  }
});

app.post("/copySch", async (req, res) => {
  var reserv;
  members = req.body.members.toString().split(",");
  data = new Array();
  for (let i = 0; i < members.length; i++) {
    if (members[i] != null) {
      data.push(members[i]);
    }
  }
  const organization = await Organization.findOne({
    _id: req.body.orgId,
  });
  if (organization) {
    const chamber = await organization.chambers.find(
      (chamber) => chamber._id == req.body.chamberId
    );
    if (chamber) {
      reserv = await chamber.reservations.find(
        (r) => r._id == req.body.selectedDate
      );
    } else {
      return res.status(500).json("Internal Server Error");
    }
  } else {
    return res.status(500).json("Internal Server Error");
  }
  const toOrganization = await Organization.findOne({
    _id: data[0],
  });
  if (toOrganization) {
    const toChamber = await toOrganization.chambers.find(
      (chamber) => chamber._id == data[1]
    );
    if (toChamber) {
      if (toChamber.reservations == undefined) toChamber.reservations = [];
      toChamber.reservations.push(reserv);
      toOrganization.chambers.pull(toChamber);
      toOrganization.chambers.push(toChamber);
      toOrganization.save();
    } else {
      return res.status(500).json("Internal Server Error");
    }
  } else {
    return res.status(500).json("Internal Server Error");
  }
  return res.redirect("/report");
});

app.post("/update-chamber-members", async (req, res) => {
  const organization = await Organization.findOne({
    _id: req.body.orgId,
  });
  if (organization) {
    const chamber = organization.chambers.find(
      (chamber) => chamber._id == req.body.chamberId
    );
    if (chamber) {
      const from = req.body.from;
      const to = req.body.to;
      members = new Array();
      members = req.body.members
        .toString()
        .split(",")
        .map(function (item) {
          if (item.includes("@")) return item.trim();
          else return null;
        });
      newMembers = new Array();
      for (let i = 0; i < members.length; i++) {
        if (members[i] != null) {
          newMembers.push(members[i]);
        }
      }
      const fromTo = from + " to " + to;
      selectedDate = req.body.selectedDate;
      //  const reservation = chamber.reservations.findOne({date: selectedDate})
      // chamber.reservations.selectedDate = {};
      var reservation = null;
      if (chamber.reservations == undefined) chamber.reservations = [];
      if (req.body.from && req.body.to) {
        const reserv = chamber.reservations.findIndex(
          (res) => res.time == fromTo && res.date == selectedDate
        );
        if (reserv > -1) chamber.reservations.splice(reserv, 1);
        reservation = new Reservation({
          date: selectedDate,
          members: newMembers,
          time: fromTo,
        });
      } else {
        const reserv = chamber.reservations.findIndex(
          (res) => res.date == selectedDate && res.time == "Full Day"
        );
        if (reserv > -1) chamber.reservations.splice(reserv, 1);
        reservation = new Reservation({
          date: selectedDate,
          members: newMembers,
          time: "Full Day",
        });
      }
      chamber.reservations.push(reservation);
      organization.chambers.pull(chamber);
      organization.chambers.push(chamber);
      organization.save();
    } else {
      return res.status(500).json("Internal Server Error");
    }
    return res.redirect("/schedule/");
  } else {
    return res.status(500).json("Internal Server Error");
  }
});

app.post("/new-organization", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (user) {
      organization = new Organization({
        owner: user._id,
        name: req.body.name,
        chambers: [],
      });
      for (let i = 0; i < req.body.no; i++) {
        const chamber = new Chamber({
          name: `Chamber-${i + 1}`,
          members: {},
          maxCapacity: 10,
        });
        organization.chambers.push(chamber);
      }
      await organization.save();
      user.organizations.push(organization._id);
      await user.save();
      return res.redirect("/organizations");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal Server Error");
  }
});

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

app.post("/update-chamber", async (req, res) => {
  try {
    const organization = await Organization.findOne({ _id: req.body.orgId });
    if (organization) {
      const chamber = organization.chambers.find(
        (chamber) => chamber._id == req.body.chamberId
      );
      if (chamber) {
        if (req.body.name) {
          chamber.name = req.body.name;
        }
        if (req.body.input2) {
          chamber.maxCapacity = req.body.input2;
        }
        organization.chambers.pull(chamber);
        organization.chambers.push(chamber);
        organization.save();
      } else {
        return res.status(500).json("Internal Server Error");
      }
      return res.redirect("/management");
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

app.get("/organizations", checkAuthenticated, async function (req, res) {
  const organizations = await Organization.find({
    _id: { $in: req.user.organizations },
  });
  if (organizations) {
    res.render("organizations", {
      layout: "layouts/dashboard",
      user: req.user,
      organizations: organizations,
    });
  } else {
    res.render("organizations", {
      layout: "layouts/dashboard",
      user: req.user,
    });
  }
});

app.get("/management", checkAuthenticated, async function (req, res) {
  const organizations = await Organization.find({
    _id: { $in: req.user.organizations },
  });
  if (organizations) {
    res.render("management", {
      layout: "layouts/dashboard",
      user: req.user,
      organizations: organizations,
    });
  } else {
    res.render("management", {
      layout: "layouts/dashboard",
      user: req.user,
    });
  }
});

app.get("/schedule", checkAuthenticated, async function (req, res) {
  const organizations = await Organization.find({
    _id: { $in: req.user.organizations },
  });
  if (organizations) {
    res.render("schedule", {
      layout: "layouts/dashboard",
      user: req.user,
      organizations: organizations,
      date: req.query.date,
    });
  } else {
    res.render("schedule", {
      layout: "layouts/dashboard",
      user: req.user,
      date: req.query.date,
    });
  }
});

app.get("/report", checkAuthenticated, async function (req, res) {
  const organizations = await Organization.find({
    _id: { $in: req.user.organizations },
  });
  if (organizations) {
    res.render("report", {
      layout: "layouts/dashboard",
      user: req.user,
      organizations: organizations,
      date: req.query.date,
    });
  } else {
    res.render("report", {
      layout: "layouts/dashboard",
      user: req.user,
      date: req.query.date,
    });
  }
});

app.get("/profile", checkAuthenticated, function (req, res) {
  res.render("profile", { layout: "layouts/dashboard", user: req.user });
});

app.get("/subscription", checkAuthenticated, function (req, res) {
  res.render("subscription", { layout: "layouts/dashboard", user: req.user });
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
      return res.redirect("/");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal Server Error");
  }
});

app.get("/forgot-password", (req, res) => res.render("forgot-password"));

app.post("/password-reset", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.email });
    if (!user)
      return res.status(400).send("user with given email doesn't exist");

    let token = await ResetToken.findOne({ user: user._id });
    if (!token) {
      token = await new ResetToken({
        user: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }

    const link = `${process.env.BASE_URL}/password-reset/${user._id}/${token.token}`;
    await sendEmail(
      user.username,
      "Click this link to reset your password: ",
      link
    );

    res.send("password reset link sent to your email account");
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
});

app.get("/password-reset/:userId/:token", async (req, res) => {
  const token = await ResetToken.findOne({
    user: req.params.userId,
    token: req.params.token,
  });
  if (!token) return res.status(400).send("Invalid link or expired");
  else
    res.render("reset-password.ejs", {
      userId: req.params.userId,
      token: req.params.token,
    });
});

app.post("/password-reset/:userId/:token", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(400).send("invalid link or expired");

    const token = await ResetToken.findOne({
      user: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send("Invalid link or expired");

    user.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    await user.save();
    await ResetToken.deleteOne(token);

    res.send(
      "password changed sucessfully. <a href=" + "/login" + ">Back to login</a>"
    );
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
});

app.get("/verify/:id/:token", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send("Invalid link");

    const token = await Token.findOne({
      user: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send("Invalid link");

    user.verified = true;
    await user.save();
    await Token.findByIdAndRemove(token._id);

    res.send("email verified sucessfully");
  } catch (error) {
    res.status(400).send("An error occured");
  }
});

app.listen(port, () => console.log(`Server started on port ${port}!`));
