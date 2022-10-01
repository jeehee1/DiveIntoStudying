const express = require("express");
const passport = require("passport");
const users = require("../controllers/users");
const { isLoggedIn } = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const router = express.Router();

router
  .route("/register")
  .get(users.userRegisterForm)
  .post(catchAsync(users.userRegister));

router
  .route("/login")
  .get(users.loginForm)
  .post(
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureMessage: true,
      keepSessionInfo: true,
    }),
    users.userLogin
  );

router.get("/logout", isLoggedIn, users.userLogout);

module.exports = router;
