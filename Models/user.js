const mongoose = require('mongoose');


const newUserSchema = mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    password: { type: String, required: true },
    dob: { type: String, required: true },
    hobbies: { type: [String], required: true },
    gender: { type: String, required: true }

}, { timestamps: true });

module.exports = mongoose.model("user", newUserSchema)