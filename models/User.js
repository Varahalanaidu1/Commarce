const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const UserSchema = new mongoose.Schema({
    name: { 
         type: String,
         required: true },

    email: { 
         type: String, 
         required: true, 
         unique: true },
    password: {
         type: String,
         required: true
         },
});
{Timestamp:true}
module.exports = mongoose.model('User', UserSchema);
