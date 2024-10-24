const express = require('express')
const app = express()
const router = express.Router()
const user = require('../Models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const SECRET_KEY = "191919"
const nodemailer = require('nodemailer')
const bodyParser = require('body-parser')
require('dotenv').config();
app.use(bodyParser.json());
const { sendResetCode, resetPassword } = require('../Usercontroller');


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

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

router.post("/forgotpassword", async (req, res) => {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({ message: "Email is required" })
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000);

    console.log(`Reset code for ${email}: ${resetCode}`);

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Password Reset Code',
        text: `Your password reset code is: ${resetCode}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Reset code sent to your email' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send reset code' });
    }

})


router.post('/sendresetcode', sendResetCode);
router.post('/resetpassword', resetPassword);




module.exports = router