/** Database setup for BizTime. */

import pg from "pg";
const Client = pg.Client;
let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql:///biztime_test";
} else {
  DB_URI = "postgresql:///biztime";
}

//TODO export to controllers if this function is being used only by routers. if being used by  other parts of app, keep in utils.
export async function executeQueries(userQuery) {
  try {
    /* Self-Notes:
    Creating the biztime client inside the try block restricts its scope to that block.
    This ensures that the client is not accessible outside of the executeQueries function.
    Keeping the client's scope localized reduces the chances of unintended interactions or shared state between different parts of your application.
   
    By creating and using the client instance within a limited scope (inside the try block), 
    I follow best practices for managing PostgreSQL clients in Node.js applications.
    This approach helps prevent issues related to client reuse and ensures proper connection management.
    */

    const biztime = new Client({
      connectionString: DB_URI,
    });

    //Establish DB connection
    await biztime.connect();

    const result = await biztime.query(userQuery);
    await biztime.end();
    return result;
  } catch (error) {
    console.error("Error executing queries:", error);
  }
}
