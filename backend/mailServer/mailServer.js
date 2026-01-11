"use strict";
const nodemailer = require("nodemailer");
const { AccountVerificationTemplate } = require("./template");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.ERP_MAIL_HOST,
    pass: process.env.ERP_MAIL_PASSWORD,
  },
});

async function mailServer(to, subject, template) {
  const info = await transporter.sendMail({
    from: {
      name: "ERP",
      address: "sakthiveltofficial@gmail.com",
    },
    to: to,
    subject: subject, //Account Verification
    text: "",
    html: template, // Use the HTML template here
  });

  if (!info.messageId) return false;

  return info.messageId;
}

module.exports.mailServer = mailServer;

// mailServer(
//   "sakthiveltofficial@gmail.com",
//   "Account Verification ",
//   AccountVerificationTemplate("some templete")
// ).catch(console.error);
