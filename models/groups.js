const mongoose = require('mongoose');
const Schema = mongoose.Schema

const groupSchema = new Schema({
    title: String,
    subject: String,
    location: String,
    times: Number,
    online: {
        type: String,
        enum: ['y', 'n']
    },
    description: String
})

module.exports = mongoose.model('Group', groupSchema);