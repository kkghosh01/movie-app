const mongoose = require("mongoose");
const config = require("./config.js");

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

const app = require("./index.js");

const uri =
  config.dbUser && config.dbPassword
    ? `mongodb+srv://${config.dbUser}:${encodeURIComponent(
        config.dbPassword
      )}@${config.dbCluster}/${config.dbName}?appName=Cluster0`
    : `mongodb://${config.dbCluster}/${config.dbName}`;

mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port} [${config.env}]`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
