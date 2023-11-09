import express from "express";
import { executeQueries } from "../utils/db.js";

export const industriesRouter = express.Router();

industriesRouter.use(express.json());

industriesRouter.get("/", async function (req, res, next) {
  try {
    const getQuery = `SELECT industry,companies_code FROM industries JOIN itype ON industries.code=itype.industries_code;`;

    const response = await executeQueries(getQuery);

    return res.status(201).json({ industries: response.rows });
  } catch (error) {
    return next(error);
  }
});

industriesRouter.post("/", async function (req, res, next) {
  try {
    const postQuery = `INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING *`;

    const response = await executeQueries(postQuery, [
      req.body.code,
      req.body.industry,
    ]);

    return res.status(201).json({ created: response.rows[0] });
  } catch (error) {
    return next(error);
  }
});

industriesRouter.post("/associate-company", async function (req, res, next) {
  try {
    const postQuery = `INSERT INTO itype (industries_code,companies_code) VALUES ($1, $2) RETURNING *`;

    const response = await executeQueries(postQuery, [
      req.body.industries_code,
      req.body.companies_code,
    ]);

    return res.status(201).json({ created: response.rows[0] });
  } catch (error) {
    return next(error);
  }
});
