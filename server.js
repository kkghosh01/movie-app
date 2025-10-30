require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./index.js");

const uri = `mongodb+srv://${process.env.DB_USER}:${encodeURIComponent(
  process.env.DB_PASSWORD
)}@${process.env.DB_CLUSTER}/${process.env.DB_NAME}?appName=Cluster0`;

mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running and listening on port ${port}`);
});
