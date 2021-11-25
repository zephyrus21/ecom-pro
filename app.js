const express = require("express");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const yaml = require("yamljs");

const { home } = require("./routes/home");

const swaggerDocument = yaml.load("./swagger.yaml");

const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());
app.use(morgan("dev"));

app.use("/api/v1", home);

module.exports = app;
