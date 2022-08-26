const express = require('express');
const engine = require('ejs-mate');
const path = require('path')

const app = express();

app.engine('ejs', engine);

app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('show');
})

app.listen(3000);