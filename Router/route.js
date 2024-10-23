const express = require('express')
const router = express.Router()
const user = require('../Models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const SECRET_KEY = "191919"

router.post("/register", async (req, res) => {
    const { firstname, lastname, email, address, city, pincode, password, dob, hobbies, gender } = req.body
    try {
        const existingUser = await user.findOne({ email: email })
        if (existingUser) {
            return res.status(400).json({ message: "User Already Exists" })
        }
        const hashPassword = await bcrypt.hash(password, 10)

        const createUser = await user.create({
            firstname: firstname,
            lastname: lastname,
            email: email,
            address: address,
            city: city,
            pincode: pincode,
            password: hashPassword,
            dob: dob,
            hobbies: hobbies,
            gender: gender
        })

        const token = jwt.sign({ email: createUser.email, id: createUser.id }, SECRET_KEY)

        res.status(201).json({ user: createUser, token: token })


    } catch (error) {
        res.status(500).json({ message: "API NOT Working" })
    }
})

router.post("/signin", async (req, res) => {

    const { email, password } = req.body
    try {
        const existingUser = await user.findOne({ email: email })
        if (!existingUser) {
            return res.status(404).json({ message: "User Not Found" })
        }
        const matchPassword = await bcrypt.compare(password, existingUser.password)
        if (!matchPassword) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }
        const token = jwt.sign({ email: existingUser.email, id: existingUser.id }, SECRET_KEY)
        res.status(201).json({ user: existingUser, token: token })


    } catch (error) {
        res.status(500).json({ message: "Something went wrong" })
    }
})

module.exports = router