const express = require('express');
const engine = require('ejs-mate');
const path = require('path')
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Group = require('./models/groups');


main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://localhost:27017/studyingGroup');
    console.log('CONNECTED ON MONGO DATABASE!')
}



const app = express();

app.engine('ejs', engine);

app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/', async (req, res) => {
    const groups = await Group.find({});
    res.render('index', { groups });
})

app.get('/groups/new', (req, res) => {
    res.render('new');
})

app.post('/groups', async (req, res) => {
    const newGroup = new Group(req.body);
    await newGroup.save();
    const groups = await Group.find({});
    res.render('index', { groups });
})

app.listen(3000, (req, res) => {
    console.log('CONNECTED ON PORT 3000');
});