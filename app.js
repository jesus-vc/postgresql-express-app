/** BizTime express application. */

// import { router } from "./routes/companies.js";
import express from "express";
import { companiesRouter } from "./routes/companies.js";
import { invoicesRouter } from "./routes/invoices.js";
import { industriesRouter } from "./routes/industries.js";

import {
  handle404Error,
  handleGeneralError,
} from "./middleware/errorHandler.js";

export const app = express();

app.use("/companies", companiesRouter);
app.use("/invoices", invoicesRouter);
app.use("/industries", industriesRouter);

/** 404 handler */
app.use(handle404Error);

/** general error handler */
app.use(handleGeneralError);
