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
    const companyCode = req.params.code;
    const userQuery = `SELECT * FROM companies WHERE code = '${companyCode}'`;
    const companiesResponse = await executeQueries(userQuery);

    if (companiesResponse.rowCount > 0) {
      const invoicesQuery = `SELECT * FROM invoices WHERE comp_code = '${companyCode}'`;
      const invoicesResponse = await executeQueries(invoicesQuery);

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
    const putQuery = `INSERT INTO companies (code, name, description) VALUES ('${companyCode}', '${req.body.name}', '${req.body.description}')`;

    await executeQueries(putQuery);

    const getQuery = `SELECT * FROM companies WHERE code = '${companyCode}'`;
    const getResponse = await executeQueries(getQuery);

    return res.json({ company: getResponse.rows[0] });
  } catch (error) {
    next(error);
  }
});

companiesRouter.put("/:code", async function (req, res, next) {
  try {
    const updateQuery = `UPDATE companies SET name = '${req.body.name}', description = '${req.body.description}' WHERE code = '${req.params.code}'`;

    await executeQueries(updateQuery);

    const getQuery = `SELECT * FROM companies WHERE code = '${req.params.code}'`;
    const getResponse = await executeQueries(getQuery);

    return res.json({ company: getResponse.rows[0] });
  } catch (error) {
    next(error);
  }
});

companiesRouter.delete("/:code", async function (req, res, next) {
  try {
    const deleteQuery = `DELETE FROM companies WHERE code = '${req.params.code}'`;
    const response = await executeQueries(deleteQuery);
    if (response.rowCount > 0) {
      return res.json({ status: "deleted" });
    } else {
      throw new ExpressError("Company Not Found", 404);
    }
  } catch (error) {
    next(error);
  }
});
