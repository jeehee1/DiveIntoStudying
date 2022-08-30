const express = require("express");
const engine = require("ejs-mate");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Group = require("./models/groups");
const { groupEnd } = require("console");
const { subjects } = require("./datas/seedHelpers");
const ExpressError = require("./utils/expressError");
const catchAsync = require("./utils/catchAsync");

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

app.get("/groups", async (req, res) => {
  const groups = await Group.find({});
  res.render("studygroups/index", { groups, subjects });
});

app.get("/groups/new", (req, res) => {
  res.render("new");
});

app.get(
  "/groups/subjects/:subject",
  catchAsync(async (req, res) => {
    const { subject } = req.params;
    const groups = await Group.find({ subject: subject });
    res.render("studygroups/subjects", { groups, subject });
  })
);

app.get(
  "/groups/:id",
  catchAsync(async (req, res) => {
    const group = await Group.findById(req.params.id);
    res.render("studygroups/show", { group });
  })
);

app.get(
  "/groups/:id/edit",
  catchAsync(async (req, res) => {
    const group = await Group.findById(req.params.id);
    res.render("studygroups/edit", { group });
  })
);

app.post(
  "/groups",
  catchAsync(async (req, res) => {
    const newGroup = new Group(req.body);
    if (req.body.online !== "y") {
      newGroup.online = "n";
    }
    await newGroup.save();
    const groups = await Group.find({});
    res.render("studygroups/index", { groups });
  })
);

app.put(
  "/groups/:id",
  catchAsync(async (req, res) => {
    console.log(req.body);
    const { id } = req.params;
    const groupInfo = req.body;
    if (!groupInfo.online) {
      const group = await Group.findByIdAndUpdate(id, {
        ...groupInfo,
        online: "n",
      });
    } else {
      const group = await Group.findByIdAndUpdate(id, groupInfo);
    }
    res.redirect(`/groups/${id}`);
  })
);

app.get("/register", (req, res) => {
  res.render("users/register");
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

app.listen(3000, (req, res) => {
  console.log("CONNECTED ON PORT 3000");
});
