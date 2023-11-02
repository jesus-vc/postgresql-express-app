import express from "express";
import slugify from "slugify";
import { executeQueries } from "../utils/db.js";
import { ExpressError } from "../utils/expressError.js";

export const companiesRouter = express.Router();

companiesRouter.use(express.json());

companiesRouter.get("/", async function (req, res, next) {
  try {
    const companiesQuery = `SELECT * FROM companies`;
    const response = await executeQueries(companiesQuery);
    const result = response.rows.map(({ code, name }) => {
      return { code, name };
    });

    return res.json({ companies: result });
  } catch (error) {
    next(error);
  }
});

companiesRouter.get("/:code", async function (req, res, next) {
  try {
    const { code: companyCode } = req.params;
    const userQuery = `SELECT * FROM companies WHERE code = $1`;

    const companiesResponse = await executeQueries(userQuery, [companyCode]);

    if (companiesResponse.rowCount > 0) {
      const invoicesQuery = `SELECT * FROM invoices WHERE comp_code = $1`;
      const invoicesResponse = await executeQueries(invoicesQuery, [
        companyCode,
      ]);

      return res.json({
        company: companiesResponse.rows[0],
        invoices: invoicesResponse.rows,
      });
    } else {
      throw new ExpressError("Company Not Found", 404);
    }
  } catch (error) {
    next(error);
  }
});

companiesRouter.post("/", async function (req, res, next) {
  try {
    const companyCode = slugify(req.body.name);
    const putQuery = `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3)`;

    await executeQueries(putQuery, [
      companyCode,
      req.body.name,
      req.body.description,
    ]);

    const getQuery = `SELECT * FROM companies WHERE code = $1`;
    const getResponse = await executeQueries(getQuery, [companyCode]);

    return res.json({ company: getResponse.rows[0] });
  } catch (error) {
    next(error);
  }
});

companiesRouter.put("/:code", async function (req, res, next) {
  try {
    const updateQuery = `UPDATE companies SET name = $1, description = $2 WHERE code = $3`;

    await executeQueries(updateQuery, [
      req.body.name,
      req.body.description,
      req.params.code,
    ]);

    const getQuery = `SELECT * FROM companies WHERE code = $1`;
    const getResponse = await executeQueries(getQuery, [req.params.code]);

    return res.json({ company: getResponse.rows[0] });
  } catch (error) {
    next(error);
  }
});

companiesRouter.delete("/:code", async function (req, res, next) {
  try {
    const deleteQuery = `DELETE FROM companies WHERE code = $1`;
    const response = await executeQueries(deleteQuery, [req.params.code]);
    if (response.rowCount > 0) {
      return res.json({ status: "deleted" });
    } else {
      throw new ExpressError("Company Not Found", 404);
    }
  } catch (error) {
    next(error);
  }
});
