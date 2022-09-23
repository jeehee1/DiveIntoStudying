const mongoose = require("mongoose");
const Group = require("../models/groups");
const cities = require("./cities");
const { descriptors, places, subjects } = require("./seedHelpers");

main()
  .then(console.log("MONGO DB HAS BEEN SUCCESSFULLY CONNECTED."))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/studyingGroup");
}

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDB = async () => {
  await Group.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const ranNum = Math.floor(Math.random() * 1000);
    const ranTimes = Math.floor(Math.random() * 7) + 1;
    const ranSubject = Math.floor(Math.random() * 10);
    const yn = ["y", "n"];
    const ranYn = Math.floor(Math.random() * 2);
    const group = new Group({
      location: `${cities[ranNum].city}, ${cities[ranNum].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      subject: `${subjects[ranSubject]}`,
      times: ranTimes,
      online: `${yn[ranYn]}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio ex repellendus labore rem eveniet sequi, repellat aliquam quia assumenda, nobis eos dolorem necessitatibus placeat tenetur error deleniti consectetur quam similique?",
      leader: "6316eb8c584ca4c72e2e744d",
      image: {
        url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8bGlicmFyeXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60",
        filename: "library",
      },
      members: [],
    });
    await group.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
