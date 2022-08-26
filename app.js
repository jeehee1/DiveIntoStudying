const express = require('express');
const engine = require('ejs-mate');
const path = require('path')
const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://localhost:27017/studyingGroup');
    console.log('CONNECTED ON MONGO DATABASE!')
}

const groupSchema = new mongoose.Schema({
    title: String,
    subject: String,
    location: String,
    meeting_times: Number,
    online: {
        type: String,
        enum: ['y', 'n']
    },
    description: String
})

const Group = mongoose.model('Group', groupSchema);

const app = express();

app.engine('ejs', engine);

app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
    // const testData = new Group({
    //     title: "awefawefwa",
    //     subject: "wefawe",
    //     location: "NY",
    //     meeting_times: 2,
    //     online: 'n',
    //     description: 'ksfj;walkhjgl;khw;alkgjw'
    // });
    // await testData.save();
    console.log('saved')
    const groups = await Group.find({});
    res.render('index', { groups });
})

app.listen(3000, (req, res) => {
    console.log('CONNECTED ON PORT 3000');
});