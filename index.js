require("dotenv").config();
const cloudinary = require("cloudinary");
const app = require("./app");
const connectWithDb = require("./config/db");

const { PORT } = process.env;

connectWithDb();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
