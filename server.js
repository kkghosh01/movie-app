const mongoose = require("mongoose");
const config = require("./config.js");
const app = require("./index.js");

const uri = `mongodb+srv://${config.dbUser}:${encodeURIComponent(
  config.dbPassword
)}@${config.dbCluster}/${config.dbName}?appName=Cluster0`;

mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(
    `Server is running and listening on port ${port} [${config.env}]`
  );
});
