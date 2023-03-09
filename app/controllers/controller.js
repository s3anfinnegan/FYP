const db = require("../models");
const Receipt = db.receipts;
const nodemailer = require("nodemailer");
const axios = require("axios");
const pdf = require("html-pdf");

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

// Send email with receipt details
exports.sendEmail = (req, res) => {
  async function main() {
    try {
      // create reusable transporter object using the default SMTP transport

      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: "seansfyp2@gmail.com", // created a gmail account for the project
          pass: "password goes here", // using a generated app password for the project
        },
      });

      const htmlConverted = await convertJsonToHtml();

      const pdfPromise = new Promise((resolve, reject) => {
        pdf.create(htmlConverted).toBuffer((err, buffer) => {
          if (err) {
            reject(err);
          } else {
            resolve(buffer);
          }
        });
      });
      const pdfBuffer = await pdfPromise;
      // send mail with defined transport object
      transporter.sendMail({
        from: '"FYP Emailer" <seansfyp2@gmail.com>', // sender address
        to: "email goes here", // Xero email address
        subject: "New Expense!🧾", // Subject line
        attachments: [
          {
            filename: "receipt.pdf",
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
        html: htmlConverted,
      });

      console.log("Expense uploaded!");
    } catch (error) {
      console.log(error);
    }
  }
  main().catch(console.error);
};

// Create and Save a new Receipt
exports.create = (req, res) => {
  // Validate request
  if (!req.body.shop_name) {
    res.status(400).json({ message: "Content can not be empty!" });
    return;
  }

  // Create a Receipt
  const receipt = new Receipt({
    shop_name: req.body.shop_name,
    item1: req.body.item1,
    item2: req.body.item2,
    item3: req.body.item3,
    price1: req.body.price1,
    price2: req.body.price2,
    price3: req.body.price3,
    cashier: req.body.cashier,
  });

  // Save Receipt in the database
  receipt
    .save(receipt)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Some error occurred while creating the Receipt.",
      });
    });
};

// Retrieve all Receipt from the database.
exports.findAll = (req, res) => {
  const shop_name = req.query.shop_name;
  var condition = shop_name
    ? { shop_name: { $regex: new RegExp(shop_name), $options: "i" } }
    : {};

  Receipt.find(condition)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Some error occurred while retrieving Receipts.",
      });
    });
};

// Find a single Receipt with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Receipt.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).json({ message: "Not found Receipt with id " + id });
      else res.json(data);
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: "Error retrieving Receipt with id=" + id });
    });
};

// Update a Receipt by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      message: "Data to update can not be empty!",
    });
  }

  const id = req.params.id;

  Receipt.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).json({
          message: `Cannot update Receipt with id=${id}. Maybe Receipt was not found!`,
        });
      } else res.json({ message: "Receipt was updated successfully." });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Error updating Receipt with id=" + id,
      });
    });
};

// Delete a Receipt with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Receipt.findByIdAndRemove(id, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).json({
          message: `Cannot delete Receipt with id=${id}. Maybe Receipt was not found!`,
        });
      } else {
        res.json({
          message: "Receipt was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Could not delete Receipt with id=" + id,
      });
    });
};

// Delete all Receipts from the database.
exports.deleteAll = (req, res) => {
  Receipt.deleteMany({})
    .then((data) => {
      res.json({
        message: `${data.deletedCount} Receipts were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Some error occurred while removing all Receipts.",
      });
    });
};

// Find all published Receipts
exports.findAllPublished = (req, res) => {
  Receipt.find({ published: true })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Some error occurred while retrieving Receipts.",
      });
    });
};

exports.findLatest = (req, res) => {
  Receipt.find()
    .sort({ createdAt: "desc" })
    .limit(1)
    .then((receipts) => {
      res.send(receipts[0]);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving receipts.",
      });
    });
};
