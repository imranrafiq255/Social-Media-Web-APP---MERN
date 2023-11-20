const app = require("../server/app");
const { databaseConnection } = require("../server/config/database");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

app.listen(process.env.PORT, () => {
  console.log("Server is connected on " + process.env.PORT + " port");
});
