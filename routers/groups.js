const express = require("express");
const {
  isLoggedIn,
  validateGroup,
  isLeader,
  isMember,
} = require("../middleware");
const router = express.Router();
const Group = require("../models/groups");
const multer = require("multer");
const { storage } = require("../cloudinary");
const catchAsync = require("../utils/catchAsync");
const upload = multer({ storage });
const { subjects } = require("../datas/seedHelpers");

router
  .route("/")
  .get(async (req, res) => {
    const groups = await Group.find({});
    res.render("groups/index", { groups, subjects });
  })
  .post(
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

router.get("/new", isLoggedIn, (req, res) => {
  res.render("groups/new");
});

router.get(
  "/groups/subjects/:subject",
  catchAsync(async (req, res) => {
    const { subject } = req.params;
    const groups = await Group.find({ subject });
    res.render("groups/subjects", { groups, subject, subjects });
  })
);

router
  .route("/:id")
  .get(
    catchAsync(async (req, res) => {
      const group = await Group.findById(req.params.id)
        .populate("members")
        .populate("leader");
      res.render("groups/show", { group });
    })
  )
  .put(
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
  )
  .delete(
    isLoggedIn,
    isLeader,
    catchAsync(async (req, res) => {
      const group = await Group.findByIdAndDelete(req.params.id);
      console.log(group);
      res.redirect("/groups");
    })
  );

router.get(
  "/:id/join",
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

router.get(
  "/:id/edit",
  isLoggedIn,
  isLeader,
  catchAsync(async (req, res) => {
    const group = await Group.findById(req.params.id);
    res.render("groups/edit", { group });
  })
);

module.exports = router;
