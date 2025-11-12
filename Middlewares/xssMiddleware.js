const xss = require("xss");

const sanitizeXSS = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (typeof obj === "string") return xss(obj);
    if (Array.isArray(obj)) return obj.map(sanitizeObject);
    if (typeof obj === "object" && obj !== null) {
      for (let key in obj) obj[key] = sanitizeObject(obj[key]);
    }
    return obj;
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
};

module.exports = sanitizeXSS;
