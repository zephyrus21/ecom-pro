require("dotenv").config();
const app = require("./app");
const connectWithDb = require("./config/db");

const { PORT } = process.env;

connectWithDb();

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
