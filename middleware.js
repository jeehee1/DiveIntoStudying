module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first");
    return res.redirect("/login");
  } else {
    next();
  }
};

module.exports.validateGroup = (req, res, next) => {
  console.log(req.body);
  const { error } = groupSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isLeader = async (req, res, next) => {
  const { id } = req.params;
  const group = await Group.findById(id);
  if (!group.leader.equals(req.user._id)) {
    req.flash("error", "You are not allowed to edit.");
    return res.redirect(`/groups/${group._id}`);
  }
  next();
};
