const mongoose = require("mongoose");

if (process.env.NODE_ENV !== "producton") {
  require("dotenv").config();
}
exports.databaseConnection = mongoose
  .connect(process.env.MONGO_URI)
  .then((con) =>
    console.log(`Database is connected on ${con.connection.host}`)
  );
