const nodemailer = require('nodemailer')

const sendEmail = async (email, subject, text) => {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.MAIL_ADD,
          pass: process.env.MAIL_PW,
        },
      });
  
      await transporter.sendMail({
        from: process.env.MAIL_ADD,
        to: email,
        subject: subject,
        text: text,
      });
      console.log('Email sent.');
    } catch {
      console.log('Sending E-Mail failed.');
    }
  };
  
  module.exports = sendEmail;