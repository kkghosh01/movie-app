const checkIfExistsById = (Model, paramId = "id") => {
  return async (req, res, next) => {
    try {
      const doc = await Model.findById(req.params[paramId]);
      if (!doc) {
        return res.status(404).json({
          status: "fail",
          message: `${Model.modelName} not found`,
        });
      }

      req.doc = doc;
      next();
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: error.errors
          ? Object.values(error.errors)
              .map((el) => el.message)
              .join(",")
          : error.message,
      });
    }
  };
};

const checkIfExistsBySlug = (Model, param = "slug") => {
  return async (req, res, next) => {
    try {
      const doc = await Model.findOne({ slug: req.params[param] });
      if (!doc) {
        return res.status(404).json({
          status: "fail",
          message: `${Model.modelName} not found`,
        });
      }

      req.doc = doc;
      next();
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: error.errors
          ? Object.values(error.errors)
              .map((el) => el.message)
              .join(",")
          : error.message,
      });
    }
  };
};

module.exports = { checkIfExistsById, checkIfExistsBySlug };
