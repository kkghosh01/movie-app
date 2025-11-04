const dotenv = require("dotenv");

const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });

const config = {
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbCluster: process.env.DB_CLUSTER,
  dbName: process.env.DB_NAME,
  port: process.env.PORT || 3000,
  env: env,
};

module.exports = config;
