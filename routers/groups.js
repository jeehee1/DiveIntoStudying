const express = require("express");
const Group = require("../models/groups");
const {
  isLoggedIn,
  validateGroup,
  isLeader,
  isMember,
} = require("../middleware");
const router = express.Router();
const multer = require("multer");
const catchAsync = require("../utils/catchAsync");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const groups = require("../controllers/groups");

router
  .route("/")
  .get(catchAsync(groups.groupIndex))
  .post(
    isLoggedIn,
    upload.single("image"),
    validateGroup,
    catchAsync(groups.createGroup)
  );

router.get("/new", isLoggedIn, groups.newGroupForm);

router.get("/subjects/:subject", catchAsync(groups.findGroupBySubject));

router
  .route("/:id")
  .get(catchAsync(groups.showGroup))
  .put(
    isLoggedIn,
    isLeader,
    upload.single("image"),
    validateGroup,
    catchAsync(groups.editGroup)
  )
  .delete(isLoggedIn, isLeader, catchAsync(groups.deleteGroup));

router.get("/:id/join", isLoggedIn, isMember, catchAsync(groups.addMember));

router.get("/:id/edit", isLoggedIn, isLeader, catchAsync(groups.editGroupForm));

module.exports = router;
