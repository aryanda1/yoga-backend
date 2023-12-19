import nodemailer from "nodemailer";
import "dotenv/config";
const contactEmail = nodemailer.createTransport({
  service: "Yahoo",
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWD,
  },
});

contactEmail.verify((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready to Send");
  }
});

export async function sendMail(req, res) {
  const { name, email, message } = req.body;
  var content = `name: ${name} \n email: ${email} \n message: ${message} `;
  var mail = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_RECEIVER, // Change to email address that you want to receive messages on
    subject: "New Message from Contact Form domain",
    text: content,
  };
  contactEmail.sendMail(mail, (err, data) => {
    if (err) {
      res.json("fail");
    } else {
      res.json("success");
    }
  });
}
