"use strict";
const express = require("express");
const router = express.Router();
const { sendEmail } = require("./sendEmail");
const dns = require("dns");

router.post("/verify-email", async (req, res, next) => {
  let emails = req.body.emails;
  applyPromiseToAllEmails(emails)
    .then((resultMap) => {
      return res.json({
        emails: emails.map((email) => {
          let banner;
          let errResponse;
          let isValid = true;
          let isCatchAll = "not known";
          // checking for error in the response
          if (!resultMap[email][0]) {
            banner = objectToStringWithLabels(resultMap[email][1]);
            isCatchAll = resultMap[email][1].isCatchAll;
          } else {
            errResponse = resultMap[email][0];
            // custom response from sendMailUsingNodemailer
            if (errResponse === "Invalid Email(from regex)") isValid = false;
            else errResponse = objectToStringWithLabels(resultMap[email][0]);
          }
          return {
            email,
            isValid,
            isCatchAllEmail: isCatchAll,
            response: banner || errResponse,
          };
        }),
      });
    })
    .catch((error) => {
      console.log("error in catch", error);
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

const sendMailUsingNodemailer = async (DESTINATION_EMAIL) => {
  const incomingEmail = {
    subject: "Test Email from Email Verification System",
    body: "This is a test email.",
  };

  return new Promise((resolve) => {
    if (!isValidEmail(DESTINATION_EMAIL)) {
      resolve(["Invalid Email(from regex)", null]);
    } else {
      const domain = DESTINATION_EMAIL.split("@")[1];
      checkDNSMXServer(domain).then((dnsMXLookUpResponse) => {
        if (dnsMXLookUpResponse.error) {
          resolve([dnsMXLookUpResponse.err, null]);
        } else {
          resolve(
            sendEmail(
              incomingEmail.subject,
              incomingEmail.body,
              DESTINATION_EMAIL,
              dnsMXLookUpResponse.isCatchAll
            )
          );
        }
      });
    }
  });
};

const checkDNSMXServer = async (domain) => {
  return new Promise((resolve, reject) => {
    dns.resolveMx(domain, (err, mxRecords) => {
      if (err) {
        console.error("DNS lookup error:", err);
        resolve({ error: "DNS lookup error", err });
      }

      if (mxRecords && mxRecords.length > 0) {
        const isCatchAll = false;
        resolve({ isCatchAll });
      } else {
        const isCatchAll = true;
        resolve({ isCatchAll });
      }
    });
  });
};

const applyPromiseToAllEmails = async (emails) => {
  const promises = emails.map((email) => sendMailUsingNodemailer(email));
  return Promise.all(promises).then((results) => {
    const resultMap = {};
    for (let i = 0; i < emails.length; i++) {
      resultMap[emails[i]] = results[i];
    }
    return resultMap;
  });
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
