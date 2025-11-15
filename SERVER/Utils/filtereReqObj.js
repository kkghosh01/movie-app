const AppError = require("../Utils/appError.js");

const filterReqObj = (obj, ...allowedFields) => {
  const filteredObj = {};
  Object.keys(obj).forEach((field) => {
    if (!allowedFields.includes(field)) {
      throw new AppError(
        `You are not allowed to modify this "${field}" here.`,
        400
      );
    }
    filteredObj[field] = obj[field];
  });
  return filteredObj;
};

module.exports = filterReqObj;
