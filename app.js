require("dotenv").config();

const express = require("express");
const router = express.Router();
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
const ExpressError = require("./utils/expressError");
const catchAsync = require("./utils/catchAsync");
const { groupSchema } = require("./Schemas");
const {
  isLoggedIn,
  isLeader,
  validateGroup,
  isMember,
} = require("./middleware");

const groupsRouter = require("./routers/groups");
const usersRouter = require("./routers/users");

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

app.use("/groups", groupsRouter);
app.use("/", usersRouter);

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
