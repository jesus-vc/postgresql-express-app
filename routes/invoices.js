import express from "express";
import { executeQueries } from "../utils/db.js";
import { ExpressError } from "../utils/expressError.js";

export const invoicesRouter = express.Router();

invoicesRouter.use(express.json());

invoicesRouter.get("/", async function (req, res, next) {
  try {
    const userQuery = `SELECT * FROM invoices`;
    const response = await executeQueries(userQuery);
    const result = response.rows.map(({ id, comp_code }) => {
      return { id, comp_code };
    });
    return res.json({ invoices: result });
  } catch (error) {
    next(error);
  }
});

invoicesRouter.get("/:id", async function (req, res, next) {
  try {
    const { id: inventoryID } = req.params;
    const idQuery = `SELECT * FROM invoices WHERE id = $1`;
    const idResponse = await executeQueries(idQuery, [inventoryID]);

    if (idResponse.rowCount > 0) {
      const companyQuery = `SELECT * FROM companies WHERE code = $1`;
      const companyResponse = await executeQueries(companyQuery, [
        idResponse.rows[0].comp_code,
      ]);

      return res.json({
        invoice: idResponse.rows[0],
        company: companyResponse.rows[0],
      });
    } else {
      throw new ExpressError("Company Not Found", 404);
    }
  } catch (error) {
    next(error);
  }
});

invoicesRouter.post("/", async function (req, res, next) {
  try {
    const postQuery = `INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) VALUES ($1, $2, false, CURRENT_DATE, null)`;
    const response = await executeQueries(postQuery, [
      req.body.comp_code,
      req.body.amt,
    ]);

    const lastRowQuery = `SELECT * FROM invoices
    ORDER BY id DESC
    LIMIT 1;`;
    const idResponse = await executeQueries(lastRowQuery);

    return res.json({
      invoice: idResponse.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

invoicesRouter.put("/:id", async function (req, res, next) {
  try {
    let updateQuery;
    let params = [req.body.amt, req.params.id];
    if (req.body.paid === "true") {
      updateQuery = `UPDATE invoices SET amt = $1, paid = 'true', paid_date = CURRENT_DATE WHERE id = $2`;
    } else if (req.body.paid === "false") {
      updateQuery = `UPDATE invoices SET amt = $1, paid = 'false', paid_date = null WHERE id = $2`;
    } else {
      updateQuery = `UPDATE invoices SET amt = $1 WHERE id = $2`;
    }
    await executeQueries(updateQuery, params);

    const idQuery = `SELECT * FROM invoices WHERE id = $1`;
    const idResponse = await executeQueries(idQuery, [req.params.id]);

    return res.json({
      invoice: idResponse.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

invoicesRouter.delete("/:id", async function (req, res, next) {
  try {
    const deleteQuery = `DELETE FROM invoices WHERE id = $1`;
    const response = await executeQueries(deleteQuery, [req.params.id]);

    if (response.rowCount > 0) {
      return res.json({ status: "deleted" });
    } else {
      throw new ExpressError("Company Not Found", 404);
    }
  } catch (error) {
    next(error);
  }
});
