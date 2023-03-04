const db = require("../models");
const Receipt = db.receipts;
const nodemailer = require("nodemailer");

// Send email with receipt details
exports.sendEmail = (req, res) => {
  const {
    shop_name,
    item1,
    item2,
    item3,
    price1,
    price2,
    price3,
    cashier,
    email,
  } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Receipt from ${shop_name}`,
    html: `
    <h1>Receipt from ${shop_name}</h1>
    <p>Item 1: ${item1}, Price: $${price1}</p>
    <p>Item 2: ${item2}, Price: $${price2}</p>
    <p>Item 3: ${item3}, Price: $${price3}</p>
    <p>Cashier: ${cashier}</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email ", error);
      res.status(500).send({
        message: "Error sending email",
      });
    } else {
      console.log("Email sent: " + info.response);
      res.send("Email sent successfully!");
    }
  });
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
