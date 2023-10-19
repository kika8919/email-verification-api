const nodemailer = require("nodemailer");

// Configuration
const SMTP_SERVER = "smtp.gmail.com";
const EMAIL_USER = "kavyagg199@gmail.com";
const EMAIL_PASS = "mccdxfkhjotiatif";

// Function to send an email
const sendEmail = (subject, body, to, isCatchAll) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: SMTP_SERVER,
      port: 587,
      secure: false, // Upgrade later with STARTTLS
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: EMAIL_USER,
      to: to,
      subject: subject,
      text: body,
    };

    // Simulate an asynchronous operation
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Err: ", to, error.message);
        resolve([error, null]);
      } else {
        info.isCatchAll = isCatchAll;
        resolve([null, info]);
      }
    });
  });
};

module.exports = { sendEmail };
