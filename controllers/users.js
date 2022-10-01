const User = require("../models/users");

module.exports.userRegisterForm = (req, res) => {
  res.render("users/register");
};

module.exports.userRegister = async (req, res) => {
  const { username, password, email } = req.body;
  const user = new User({ username, email });
  const newUser = await User.register(user, password);
  res.redirect("/groups");
};

module.exports.loginForm = (req, res) => {
  req.session.returnTo = req.query.returnToUrl;
  res.render("users/login");
};

module.exports.userLogin = (req, res) => {
  req.flash("success", "Welcome Back!");
  redirectUrl = req.session.returnTo;
  req.session.returnTo = null;
  res.redirect(redirectUrl);
};

module.exports.userLogout = (req, res) => {
  const redirectUrl = req.query.returnTo;
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect(redirectUrl);
  });
};
