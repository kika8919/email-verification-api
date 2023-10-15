"use strict";
const express = require("express");
const router = express.Router();

router.get("/verify-email", (req, res, next) => {
  let emails = req.body.emails;
  emails = [
    "valid@email.com",
    "example@email.org",
    "random.email@12345",
    "invalid_email@.com",
    "name@gmail.com",
    "john.doe@catchall.com",
    "no_at_symbol.com",
    "email@valid.com",
    "random.email123@invalid.",
    "test@example.net",
    "user@catchall.org",
    "invalid_email@.org",
    "12345@email.com",
    "catchall@randommail.xyz",
    "name@email.co.uk",
    "example@email",
    "invalid@.net",
    "valid.email@emailprovider.com",
    "user@catchallmail.com",
    "random@12345.email",
  ];

  // email regex - ^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$
  return res.json({
    emails: emails.map((email) => {
      return {
        email,
        isValid: isValidEmail(email),
        isCatchAllEmail: isCatchAllEmail(email),
      };
    }),
  });
});

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
