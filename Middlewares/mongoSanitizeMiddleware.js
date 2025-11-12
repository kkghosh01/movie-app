const sanitizeMongo = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeMongo);
  } else if (typeof obj === "object" && obj !== null) {
    for (let key in obj) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key]; // remove Mongo operators like $gt, $set, etc.
      } else {
        obj[key] = sanitizeMongo(obj[key]);
      }
    }
  }
  return obj;
};

const mongoSanitizeMiddleware = (req, res, next) => {
  if (req.body) sanitizeMongo(req.body);
  if (req.query) sanitizeMongo(req.query);
  if (req.params) sanitizeMongo(req.params);
  next();
};

module.exports = mongoSanitizeMiddleware;
