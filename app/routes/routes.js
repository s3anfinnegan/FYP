module.exports = app => {
    const receipts = require("../controllers/controller.js");
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/", receipts.create);
  
    // Retrieve all Tutorials
    router.get("/", receipts.findAll);
  
    // Retrieve all published Tutorials
    router.get("/published", receipts.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", receipts.findOne);
  
    // Update a Tutorial with id
    router.put("/:id", receipts.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", receipts.delete);
  
    // Create a new Tutorial
    router.delete("/", receipts.deleteAll);
  
    app.use("/api/receipts", router);
  };