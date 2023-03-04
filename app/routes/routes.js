module.exports = (app) => {
  const receipts = require("../controllers/controller.js");

  var router = require("express").Router();

  // Retrieve the most recent receipt
  app.get("/api/receipts/latest", receipts.findLatest);

  // Send email/ Upload expense
  app.post("/upload", receipts.sendEmail);

  // Create a new Receipt
  router.post("/", receipts.create);

  // Retrieve all Receipts
  router.get("/", receipts.findAll);

  // Retrieve all published Receipts
  router.get("/published", receipts.findAllPublished);

  // Retrieve a single Receipt with id
  router.get("/:id", receipts.findOne);

  // Update a Receipt with id
  router.put("/:id", receipts.update);

  // Delete a Receipt with id
  router.delete("/:id", receipts.delete);

  // Create a new Receipt
  router.delete("/", receipts.deleteAll);

  app.use("/api/receipts", router);

  // GET for JSON to HTML
  app.get("/api/receipts/:id", router);
};
