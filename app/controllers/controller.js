const db = require("../models");
const Receipt = db.receipts;

// Create and Save a new Receipt
exports.create = (req, res) => {
  // Validate request
  if (!req.body.shop_name) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // Create a Receipt
  const receipt = new Receipt({
    shop_name: req.body.shop_name,
    item1: req.body.item1,
    item2: req.body.item2,
    item3: req.body.item3,
    published: req.body.published ? req.body.published : false
  });

  // Save Receipt in the database
  receipt
    .save(receipt)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Receipt."
      });
    });
};

// Retrieve all Receipt from the database.
exports.findAll = (req, res) => {
  const shop_name = req.query.shop_name;
  var condition = shop_name ? { shop_name: { $regex: new RegExp(shop_name), $options: "i" } } : {};

  Receipt.find(condition)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Receipts."
      });
    });
};

// Find a single Receipt with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Receipt.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Receipt with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Receipt with id=" + id });
    });
};

// Update a Receipt by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  Receipt.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Receipt with id=${id}. Maybe Receipt was not found!`
        });
      } else res.send({ message: "Receipt was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Receipt with id=" + id
      });
    });
};

// Delete a Receipt with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Receipt.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Receipt with id=${id}. Maybe Receipt was not found!`
        });
      } else {
        res.send({
          message: "Receipt was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Receipt with id=" + id
      });
    });
};

// Delete all Receipts from the database.
exports.deleteAll = (req, res) => {
    Receipt.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Receipts were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Receipts."
      });
    });
};

// Find all published Receipts
exports.findAllPublished = (req, res) => {
    Receipt.find({ published: true })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Receipts."
      });
    });
};