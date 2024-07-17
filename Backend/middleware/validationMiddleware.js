const Joi = require("joi")

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      console.log("validation error ", error.details[0].message)
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  }
}

module.exports = {
  validateRequest
};
