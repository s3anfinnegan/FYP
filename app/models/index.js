const dbConfig = require("../config/db.config.js");
const axios = require("axios");

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.receipts = require("./models.js")(mongoose);

module.exports = db;

// HTML to PDF
const pdf = require("html-pdf");

function convertHtmlToPdf(html, options = {}) {
  return new Promise((resolve, reject) => {
    pdf.create(html, options).toBuffer((error, buffer) => {
      if (error) {
        reject(error);
      } else {
        resolve(buffer);
      }
    });
  });
}
