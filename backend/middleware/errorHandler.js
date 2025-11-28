const {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} = require("../helper/customErrors");

const errorHandler = (error, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log("\x1b[31m%s\x1b[0m", "▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼");
  console.log(`[ERROR] ${timestamp} - Error in ${req.method} ${req.url}`);
  console.log(`[ERROR] Error type: ${error.constructor.name}`);
  console.log(`[ERROR] Error message: ${error.message}`);
  console.log(`[ERROR] Request body:`, req.body);
  console.log(`[ERROR] Request params:`, req.params);
  console.log(`[ERROR] Request query:`, req.query);

  if (error instanceof UnauthorizedError) {
    console.log(`[ERROR] Stack trace:`, error.stack);
    res.status(401).json({ errors: { body: [error.message] } });
  } else if (error instanceof ForbiddenError) {
    console.log(`[ERROR] Stack trace:`, error.stack);
    res.status(403).json({ errors: { body: [error.message] } });
  } else if (error instanceof NotFoundError) {
    console.log(`[ERROR] Stack trace:`, error.stack);
    res.status(404).json({ errors: { body: [error.message] } });
  } else if (error instanceof ValidationError) {
    console.log(`[ERROR] Stack trace:`, error.stack);
    res.status(422).json({ errors: { body: [error.message] } });
  } else {
    console.log(`[ERROR] Unhandled error type!`);
    console.log(`[ERROR] Full error object:`, error);
    console.log(`[ERROR] Stack trace:`, error.stack);
    res.status(500).json({ errors: { body: [error.message] } });
  }

  console.log("\x1b[31m%s\x1b[0m", "▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲");
};

module.exports = errorHandler;
