import { ExpressError } from "../utils/expressError.js";

/** 404 handler */

export function handle404Error(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
}

/** general error handler */

export function handleGeneralError(error, req, res, next) {
  // the default status is 500 Internal Server Error
  let status = error.status || 500;
  let message = error.message || "Internal Server Error";

  // set the status and alert the user
  return res.status(status).json({
    error: { message, status },
  });
}
