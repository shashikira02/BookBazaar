const path = require("path");
// const fs = require("fs");
// const https = require("https");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const { graphqlHTTP } = require("express-graphql");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
const auth = require("./middleware/auth");
const { clearImage } = require("./util/file");
const app = express();
require("dotenv").config();

// Multer configuration for file uploads
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/[:/]/g, "-") + "_" + file.originalname
    );
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// MongoDB URI from environment variables
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@bookstore.uznxj.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

// Read SSL certificates
// const privateKey = fs.readFileSync("server.key");
// const certificate = fs.readFileSync("server.cert");

// Middleware setup
app.use(bodyParser.json()); // Parse JSON bodies
app.use("/images", express.static(path.join(__dirname, "images"))); // Serve static images

// CORS configuration
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Logging setup
// const accessLogStream = fs.createWriteStream(
//   path.join(__dirname, "access.log"),
//   { flags: "a" }
// );
// app.use(morgan("combined", { stream: accessLogStream }));

// Security middleware
app.use(helmet());
app.use(compression());

// Authentication middleware
app.use(auth);

// Create Multer upload instance
const upload = multer({ storage: fileStorage, fileFilter: fileFilter });

// File upload endpoint
app.put("/post-image", upload.single("image"), (req, res, next) => {
  if (!req.isAuth) {
    const error = new Error("Not Authenticated!");
    error.code = 401;
    throw error;
  }
  if (!req.file) {
    return res.status(200).json({ message: "No image provided." });
  }

  const relativeFilePath = path
    .relative(__dirname, req.file.path)
    .replace(/\\/g, "/");

  if (req.body.oldPath) {
    try {
      clearImage(req.body.oldPath);
    } catch (err) {
      return res.status(500).json({ message: "Error clearing old image." });
    }
  }
  return res
    .status(201)
    .json({ message: "File stored.", filePath: relativeFilePath });
});

// GraphQL API endpoint
app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || "An error occurred.";
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
    },
  })
);

// Global error handler
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.code || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

// Connect to MongoDB and start HTTPS server
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 8080, () =>
      console.log(`Server is running on port ${process.env.PORT || 8080}`)
    );
    // https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(process.env.PORT || 8080, () => {
    //     console.log(`Server is running on port ${process.env.PORT || 8080}`);
    //   });
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB:", err);
  });