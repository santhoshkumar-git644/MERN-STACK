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
    if (error.name === 'ZodError') {
      const issues = error.errors || error.issues || [];
      const extractedErrors = issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return res.json({ message: 'Validation Failed', errors: extractedErrors });
    }
    return res.json({ message: 'Validation Failed', error: error.message || 'Unknown validation error' });
  }
};

module.exports = validate;
