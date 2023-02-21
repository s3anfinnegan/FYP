const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
const bodyParser = require("body-parser")
const cors = require("cors")



mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.receipts = require("./models.js")(mongoose);

module.exports = db;