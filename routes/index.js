"use strict";
const express = require("express");
const router = express.Router();
const { sendEmail } = require("./sendEmail");
const { verifyEmail } = require("./verifyEmail");

router.post("/verify-email", async (req, res, next) => {
  let emails = req.body.emails;

  applyPromiseToAllEmails(emails)
    .then((resultMap) => {
      // console.log(JSON.stringify(resultMap));
      return res.json({
        emails: emails.map((email) => {
          let banner;
          let errResponse;
          let isValid = true;
          // checking for error in the response
          if (!resultMap[email][0]) {
            banner = objectToStringWithLabels(resultMap[email][1]);
          } else {
            errResponse = resultMap[email][0];
            // custom response from sendMailUsingNodemailer
            if (errResponse === "Invalid Email(from regex)") isValid = false;
            else errResponse = objectToStringWithLabels(resultMap[email][0]);
          }
          return {
            email,
            isValid,
            isCatchAllEmail: isCatchAllEmail(email),
            response: banner || errResponse,
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

const objectToStringWithLabels = (obj) => {
  let result = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result.push(`${key}: ${obj[key]}`);
    }
  }

  return result;
};

const verifyEmailUsingEmailVerify = (email) => {
  return new Promise((resolve) => {
    if (!isValidEmail(email)) {
      resolve(["Invalid Email(from regex)", null]);
    } else {
      resolve(verifyEmail(email));
    }
  });
};

const applyPromiseToAllEmails = async (emails) => {
  const promises = emails.map((email) => verifyEmailUsingEmailVerify(email));
  return Promise.all(promises).then((results) => {
    const resultMap = {};
    for (let i = 0; i < emails.length; i++) {
      resultMap[emails[i]] = results[i];
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
