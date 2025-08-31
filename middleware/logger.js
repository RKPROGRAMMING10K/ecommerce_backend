// Logging middleware
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip}`);

  if (req.body && Object.keys(req.body).length > 0) {
    // Don't log sensitive information like passwords
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = "[HIDDEN]";
    console.log("Body:", sanitizedBody);
  }

  next();
};

module.exports = logger;
