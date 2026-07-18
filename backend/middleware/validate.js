const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    res.status(400);
    // Extract Zod errors
    const extractedErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    return res.json({ message: 'Validation Failed', errors: extractedErrors });
  }
};

module.exports = validate;
