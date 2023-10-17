"use strict";
const express = require("express");
const router = express.Router();
const { sendEmail } = require("./sendEmail");

router.post("/verify-email", async (req, res, next) => {
  let emails = req.body.emails;
  // emails = [
  //   // "valid@email.com",
  //   // "example@email.org",
  //   // "random.email@12345",
  //   // "invalid_email@.com",
  //   // "name@gmail.com",
  //   // "john.doe@catchall.com",
  //   // "no_at_symbol.com",
  //   // "email@valid.com",
  //   // "random.email123@invalid.",
  //   // "test@example.net",
  //   // "user@catchall.org",
  //   // "invalid_email@.org",
  //   // "12345@email.com",
  //   // "catchall@randommail.xyz",
  //   // "name@email.co.uk",
  //   // "example@email",
  //   // "invalid@.net",
  //   // "valid.email@emailprovider.com",
  //   // "user@catchallmail.com",
  //   // "random@12345.email",
  // ];

  applyPromiseToAllEmails(emails)
    .then((resultMap) => {
      console.log(JSON.stringify(resultMap));
      return res.json({
        emails: emails.map((email) => {
          let smtpResponse;
          // checking for error in the response
          if (!resultMap[email][0]) {
            smtpResponse = resultMap[email][1].response;
          }
          return {
            email,
            isValid: isValidEmail(email),
            isCatchAllEmail: isCatchAllEmail(email),
            smtpResponse: smtpResponse,
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
  // Split the email address into local part and domain
  const parts = email.split("@");

  if (parts.length !== 2) {
    return false; // Email should have exactly one "@" symbol
  }

  const localPart = parts[0];
  const domain = parts[1];

  // Check if the local part is not empty and does not start or end with a dot
  if (
    localPart === "" ||
    localPart[0] === "." ||
    localPart[localPart.length - 1] === "."
  ) {
    return false;
  }

  // Check if the domain is not empty and does not start or end with a dot
  if (domain === "" || domain[0] === "." || domain[domain.length - 1] === ".") {
    return false;
  }

  // Check if the domain has at least one dot (.) in it
  if (domain.indexOf(".") === -1) {
    return false;
  }

  // Check if the local part and domain do not contain invalid characters
  const invalidCharacters = /[()<>[\]:;@\\,"]/;
  if (invalidCharacters.test(localPart) || invalidCharacters.test(domain)) {
    return false;
  }

  return true;
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
