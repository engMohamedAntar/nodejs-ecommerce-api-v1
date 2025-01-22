//sendEmail.js
const nodemailer= require('nodemailer');
const asyncHandler= require('express-async-handler');
const { response, text } = require('express');

const sendEmail= asyncHandler(async(options)=>{
    //create transporter object
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',  // SMTP server for Gmail
        port: 587,               // TLS port
        secure: false,           // Use TLS
        auth: {
          user:process.env.EMAIL_USER ,  // Your Gmail address
          pass: process.env.EMAIL_PASSWORD     // App-specific password
        }
    })

    //create options object to send to the transporter
    const mailOptions= {
        from: 'E-shop app <antarexplorer1@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    //send the email
    await transporter.sendMail(mailOptions);
});

module.exports= sendEmail;
