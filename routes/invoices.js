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
    const inventoryID = req.params.id;
    const idQuery = `SELECT * FROM invoices WHERE id = '${inventoryID}'`;
    const idResponse = await executeQueries(idQuery);

    if (idResponse.rowCount > 0) {
      const companyQuery = `SELECT * FROM companies WHERE code = '${idResponse.rows[0].comp_code}'`;
      const companyResponse = await executeQueries(companyQuery);

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
    const postQuery = `INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) VALUES ('${req.body.comp_code}', ${req.body.amt}, false, CURRENT_DATE, null)`;
    const response = await executeQueries(postQuery);

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
    if (req.body.paid === "true") {
      updateQuery = `UPDATE invoices SET amt = '${req.body.amt}', paid = 'true', paid_date = CURRENT_DATE WHERE id = '${req.params.id}'`;
    } else if (req.body.paid === "false") {
      updateQuery = `UPDATE invoices SET amt = '${req.body.amt}', paid = 'false', paid_date = null WHERE id = '${req.params.id}'`;
    } else {
      updateQuery = `UPDATE invoices SET amt = '${req.body.amt}' WHERE id = '${req.params.id}'`;
    }
    await executeQueries(updateQuery);

    const idQuery = `SELECT * FROM invoices WHERE id = '${req.params.id}'`;
    const idResponse = await executeQueries(idQuery);

    return res.json({
      invoice: idResponse.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

invoicesRouter.delete("/:id", async function (req, res, next) {
  try {
    const deleteQuery = `DELETE FROM invoices WHERE id = '${req.params.id}'`;
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
