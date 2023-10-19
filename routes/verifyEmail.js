const emailVerify = require("email-verify");

const verifyEmail = (emailTo) => {
  return new Promise((resolve, reject) => {
    emailVerify.verify(emailTo, (err, info) => {
      const infoCodes = {
        finishedVerification: 1,
        invalidEmailStructure: 2,
        noMxRecords: 3,
        SMTPConnectionTimeout: 4,
        domainNotFound: 5,
        SMTPConnectionError: 6,
      };
      if (err) {
        console.error("Error:", err);
        resolve([err, null]);
      } else {
        console.log("Email verification results:", info);
        if (info.success) {
          console.log("Email exists!");
        } else {
          console.log("Email does not exist or is not valid.");
        }
        resolve([null, info]);
      }
    });
  });
};

module.exports = { verifyEmail };
