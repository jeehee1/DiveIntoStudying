require("dotenv").config();

const express = require("express");
const engine = require("ejs-mate");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const Group = require("./models/groups");
const User = require("./models/users");
const { subjects } = require("./datas/seedHelpers");
const ExpressError = require("./utils/expressError");
const catchAsync = require("./utils/catchAsync");
const { groupSchema } = require("./Schemas");
const multer = require("multer");
const { storage } = require("./cloudinary");
const {
  isLoggedIn,
  isLeader,
  validateGroup,
  isMember,
} = require("./middleware");
const upload = multer({ storage });

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/studyingGroup");
  console.log("CONNECTED ON MONGO DATABASE!");
}

const app = express();

app.engine("ejs", engine);

app.set("views", path.join(__dirname + "/views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
  name: "session",
  secret: "thisshouldbemoredifficult",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.currentUrl = req.originalUrl;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/groups", async (req, res) => {
  const groups = await Group.find({});
  res.render("groups/index", { groups, subjects });
});

app.get("/groups/new", isLoggedIn, (req, res) => {
  res.render("groups/new");
});

app.get(
  "/groups/subjects/:subject",
  catchAsync(async (req, res) => {
    const { subject } = req.params;
    const groups = await Group.find({ subject });
    res.render("groups/subjects", { groups, subject, subjects });
  })
);

app.get(
  "/groups/:id",
  catchAsync(async (req, res) => {
    const group = await Group.findById(req.params.id).populate("members");
    res.render("groups/show", { group });
  })
);

app.get(
  "/groups/:id/join",
  isLoggedIn,
  isMember,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const group = await Group.findById(id);
    group.members.push(req.user._id);
    await group.save();
    res.redirect(`/groups/${id}`);
  })
);

app.get(
  "/groups/:id/edit",
  isLoggedIn,
  isLeader,
  catchAsync(async (req, res) => {
    const group = await Group.findById(req.params.id);
    res.render("groups/edit", { group });
  })
);

app.post(
  "/groups",
  isLoggedIn,
  upload.single("image"),
  validateGroup,
  catchAsync(async (req, res) => {
    const { online } = req.body.group;
    const newGroup = new Group(req.body.group);
    if (!online) {
      newGroup.online = "n";
    }
    newGroup.image = req.file
      ? { url: req.file.path, filename: req.file.filename }
      : {
          url: "https://images.unsplash.com/photo-1500989145603-8e7ef71d639e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8c3R1ZHlpbmd8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60",
          filename: "temp",
        };
    newGroup.leader = req.user._id;
    await newGroup.save();
    req.flash("success", "Study Group has been succesfully created!");
    res.redirect(`groups/${newGroup._id}`);
  })
);

app.put(
  "/groups/:id",
  isLoggedIn,
  isLeader,
  upload.single("image"),
  validateGroup,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const groupInfo = req.body.group;
    if (!groupInfo.online || groupInfo.online !== "y") {
      const group = await Group.findByIdAndUpdate(id, {
        ...groupInfo,
        online: "n",
      });
      if (req.file) {
        group.image = { url: req.file.path, filename: req.file.filename };
        await group.save();
      }
    } else {
      const group = await Group.findByIdAndUpdate(id, groupInfo);
      if (req.file) {
        group.image = { url: req.file.path, filename: req.file.filename };
        await group.save();
      }
    }
    req.flash("success", "Study Group has been succesfully updated!");
    res.redirect(`/groups/${id}`);
  })
);

app.get("/register", (req, res) => {
  res.render("users/register");
});

app.get("/login", (req, res) => {
  res.render("users/login");
});

app.post(
  "/register",
  catchAsync(async (req, res) => {
    const { username, password, email } = req.body;
    const user = new User({ username, email });
    const newUser = await User.register(user, password);
    res.redirect("/groups");
  })
);

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureMessage: true,
    keepSessionInfo: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome Back!");
    const redirectUrl = req.session.returnTo || "/groups";
    res.redirect(redirectUrl);
  }
);

app.get("/logout", isLoggedIn, (req, res) => {
  const redirectUrl = req.query.returnTo;
  console.log(redirectUrl);
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect(redirectUrl);
  });
});

app.all("*", (req, res, next) => {
  next(new ExpressError("PAGE NOT FOUND", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = "SOMETHING WENT WRONG!";
  }
  res.status(statusCode).render("error", { err });
});

app.listen(8080, (req, res) => {
  console.log("CONNECTED ON PORT 8080");
});
