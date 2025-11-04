const mongoose = require("mongoose");
const AppError = require("../Utils/appError.js");

const checkIfExistsById = (Model, paramId = "id") => {
  return async (req, res, next) => {
    try {
      const id = req.params[paramId];

      //Invalid ObjectId check
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError(`Invalid ${Model.modelName} id`, 400));
      }

      const doc = await Model.findById(id);
      if (!doc) {
        return next(new AppError(`Invalid ${Model.modelName} not found`, 404));
      }

      req.doc = doc;
      next();
    } catch (error) {
      if (error.name === "CastError" || error.name === "TypeError") {
        return next(new AppError(`Invalid ${Model.modelName} id`, 400));
      }
      next(error);
    }
  };
};

const checkIfExistsBySlug = (Model, paramSlug = "slug") => {
  return async (req, res, next) => {
    try {
      const slug = req.params[paramSlug];
      const doc = await Model.findOne({ slug });

      if (!doc) {
        return next(new AppError(`${Model.modelName} not found`, 404));
      }

      req.doc = doc;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { checkIfExistsById, checkIfExistsBySlug };
