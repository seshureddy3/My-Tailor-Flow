export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema(req.body);

  if (error) {
    const message = error.details.map((detail) => detail.message).join(", ");
    return res.status(400).json({ success: false, message });
  }

  req.body = value;
  next();
};
