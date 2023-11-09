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
    return next(error);
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

      const industryQuery = `SELECT industry FROM companies JOIN itype ON companies.code=itype.companies_code JOIN industries ON itype.industries_code=industries.code WHERE companies.code=$1`;
      const industryResponse = await executeQueries(industryQuery, [
        companyCode,
      ]);
      const industries = industryResponse.rows.map((obj) => obj.industry);

      return res.json({
        company: companiesResponse.rows[0],
        invoices: invoicesResponse.rows,
        industries: industries,
      });
    } else {
      throw new ExpressError("Company Not Found", 404);
    }
  } catch (error) {
    return next(error);
  }
});

companiesRouter.post("/", async function (req, res, next) {
  try {
    const companyCode = slugify(req.body.name);
    const putQuery = `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`;

    const response = await executeQueries(putQuery, [
      companyCode,
      req.body.name,
      req.body.description,
    ]);

    // Note: Leaving for informational purpose. Replaced the 3 lines below with RETURN clause in the SQL queries.
    // const getQuery = `SELECT * FROM companies WHERE code = $1`;
    // const getResponse = await executeQueries(getQuery, [companyCode]);
    // return res.status(201).json({ company: getResponse.rows[0] });

    return res.status(201).json({ company: response.rows[0] });
  } catch (error) {
    return next(error);
  }
});

companiesRouter.put("/:code", async function (req, res, next) {
  try {
    const updateQuery = `UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING code, name, description`;

    const response = await executeQueries(updateQuery, [
      req.body.name,
      req.body.description,
      req.params.code,
    ]);
    return res.json({ company: response.rows[0] });
  } catch (error) {
    return next(error);
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
    return next(error);
  }
});
