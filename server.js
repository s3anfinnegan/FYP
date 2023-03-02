const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
("use strict");
const nodemailer = require("nodemailer");

var corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Go to /api/receipts to view data as JSON" });
});

require("./app/routes/routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

const db = require("./app/models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// ------------------------- Emailer setup -------------------------

// async..await is not allowed in global scope, must use a wrapper
async function main() {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "seansfyp@gmail.com", // created a gmail account for the project
      pass: "vtrunaehdzwzelsf", // using a generated app password for the project
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"FYP Emailer" <seansfyp@gmail.com>', // sender address
    to: "s.finnegan8@nuigalway.ie", // list of receivers
    subject: "New Expense!🧾", // Subject line
    text: "Please find attached your recent expense...", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  // Preview only available when sending through an Ethereal account
  console.log("Email sent!");
}

main().catch(console.error);
