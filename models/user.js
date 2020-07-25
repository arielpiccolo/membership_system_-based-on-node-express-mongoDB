
// ! Schema creation app


const mongoose = require('mongoose');


// creating a new Schema in mongodb
// Schema format
const user = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    } 
});


// exporting           - users is the collections(table), the user is the design or Schema
module.exports = mongoose.model('users', user);