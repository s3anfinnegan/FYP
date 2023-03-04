const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const pdf = require("html-pdf");

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

// JSON to HTML
// Function to convert JSON to HTML
async function convertJsonToHtml(id) {
  try {
    // Fetch receiptData data from the API
    const response = await axios.get(
      "http://localhost:8080/api/receipts/latest"
    );
    const receiptData = response.data;

    // Price and tax calculations
    var itemA = parseFloat(receiptData.price1);
    var itemB = parseFloat(receiptData.price2);
    var itemC = parseFloat(receiptData.price3);
    var totalPrice = itemA + itemB + itemC;
    // Tax @ 23%
    var totalTax = totalPrice * 0.23;

    // Convert the expense data to HTML
    const htmlConverted = `
    <h1>${receiptData.shop_name}</h1>
      <p>Time: ${receiptData.createdAt}</p>
      <p>Item 1: ${receiptData.item1}</p>
      <p>€ ${receiptData.price1}</p>
      <p>Item 2: ${receiptData.item2}</p>
      <p>€ ${receiptData.price2}</p>
      <p>Item 3: ${receiptData.item3}</p>
      <p>€ ${receiptData.price3}</p>
    <p>Total: €${totalPrice.toFixed(2)}</p>
    <p>Tax 23%: €${totalTax.toFixed(2)}</p>
    <p>Your cashier: ${receiptData.cashier}</p>
      <p>Have an amazing day!</p>
    `;
    return htmlConverted;
  } catch (error) {
    console.error(error);
  }
}

//  Nodemailer setup
// async..await is not allowed in global scope, must use a wrapper

async function main() {
  //app.post("http://localhost:8080/upload", async (req, res) => {
  //  const { email, subject, message } = req.body;

  try {
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

    const id = "63f7aa5ae9347beb7d495008";
    const htmlConverted = await convertJsonToHtml(id);

    const pdfPromise = new Promise((resolve, reject) => {
      pdf.create(htmlConverted).toBuffer((err, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer);
        }
      });
    });

    // send mail with defined transport object
    await transporter.sendMail({
      from: '"FYP Emailer" <seansfyp@gmail.com>', // sender address
      to: "seansfyp@gmail.com", // list of receivers
      subject: "New Expense!🧾", // Subject line
      attachments: [
        {
          filename: "receipt.pdf",
          content: await pdfPromise,
          contentType: "application/pdf",
        },
      ],
      html: htmlConverted,
    });

    console.log("Email sent!");
  } catch (error) {
    console.error(error);
  }
  //  });
}

main().catch(console.error);
