"use strict";
const express = require("express");
const router = express.Router();
const { sendEmail } = require("./sendEmail");

router.post("/verify-email", async (req, res, next) => {
  let emails = req.body.emails;

  applyPromiseToAllEmails(emails)
    .then((resultMap) => {
      // console.log(JSON.stringify(resultMap));
      return res.json({
        emails: emails.map((email) => {
          let smtpResponse;
          let errResponse;
          let isValid = true;
          // checking for error in the response
          if (!resultMap[email][0]) {
            smtpResponse = resultMap[email][1].response;
          } else {
            errResponse = resultMap[email][0];
            // custom response from sendMailUsingNodemailer
            if (errResponse === "Invalid Email") isValid = false;
          }
          return {
            email,
            isValid,
            isCatchAllEmail: isCatchAllEmail(email),
            response: smtpResponse || errResponse,
          };
        }),
      });
    })
    .catch((error) => {
      console.log("error");
      res.json({
        error,
        emails: [],
      });
    });
});

const sendMailUsingNodemailer = async (DESTINATION_EMAIL) => {
  if (!isValidEmail(DESTINATION_EMAIL)) {
    return ["Invalid Email", null];
  }
  // Simulating catch-all implementation
  const incomingEmail = {
    subject: "Test Email from Catch-All System",
    body: "This is a test email from the catch-all system.",
    // sender: "sender@example.com", // Replace with actual sender's email
  };

  return new Promise((resolve) => {
    resolve(
      sendEmail(incomingEmail.subject, incomingEmail.body, DESTINATION_EMAIL)
    );
  });
};

const applyPromiseToAllEmails = async (arr) => {
  const promises = arr.map((element) => sendMailUsingNodemailer(element));
  return Promise.all(promises).then((results) => {
    // Map the results back to the original elements
    const resultMap = {};
    for (let i = 0; i < arr.length; i++) {
      resultMap[arr[i]] = results[i];
    }
    return resultMap;
  });
};

const isCatchAllEmail = (email) => {
  return false;
};

const isValidEmail = (email) => {
  const emailRegex =
    /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
  return emailRegex.test(email);
};

router.get("/health", (req, res, next) => {
  try {
    res.json({
      uptime: process.uptime(),
      status: "healthy",
      timestamp: new Date(),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
// message: 2.1.5 OK u21-20020a05622a011500b00419630a935esi3113757qtw.237 - gsmtp,
