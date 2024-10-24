const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('./Models/user')
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        pass: process.env.GMAIL_PASS,  
    },
});

exports.sendResetCode = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = Math.floor(100000 + Math.random() * 900000);
        const resetPasswordExpires = Date.now() + 3600000; 

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetPasswordExpires;
        await user.save();

        const mailOptions = {
            from: process.env.GMAIL_USER, 
            to: email,                   
            subject: 'Password Reset Code',
            text: `Your password reset code is: ${resetToken}`, 
            
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Reset code sent to your email' });
    } catch (error) {
        console.error('Error sending email:', error); 
        res.status(500).json({ message: 'Failed to send reset code' });
    }
};


exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body; 

    try {
      
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }, 
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

      
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
