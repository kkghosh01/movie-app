const multer = require("multer");

// Use Memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
  const isValid = allowedFileTypes.test(file.mimetype.toLowerCase());

  if (isValid) cb(null, true);
  else
    cb(new Error("Invalid file type. Only JPEG, JPG, PNG, GIF allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
