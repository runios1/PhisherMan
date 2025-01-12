import sqlite3 from "sqlite3";

const dbPath = "Database/userRating.db";

export async function getRatingsForDomain(domain) {
  return new Promise((resolve, reject) => {
    // Open the database
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        return reject(`Failed to open database: ${err.message}`);
      }
    });

    // SQL query to get ratings
    const query = `
            SELECT positive_reports, negative_reports
            FROM domains
            WHERE domain_name = ?;
        `;

    // Execute the query
    db.get(query, [domain], (err, row) => {
      if (err) {
        db.close();
        return reject(`Query failed: ${err.message}`);
      }

      db.close();
      if (row) {
        resolve(row);
      } else {
        resolve({ positive_reports: 0, negative_reports: 0 }); // Default if no record
      }
    });
  });
}

/**
 * Updates or inserts a rating for a domain.
 * @param {string} url - The domain to update or insert.
 * @param {boolean} flag - If true, increment positive ratings; otherwise, increment negative ratings.
 * @returns {Promise<void>} - Resolves when the operation is complete.
 */
export async function updateOrInsertRating(url, flag) {
  const dbPath = "Database/userRating.db";

  const db = await openDatabase(dbPath);

  const domain = new URL(url).hostname;
  try {
    const row = await getDomainRow(db, domain);

    if (row) {
      // Update the existing domain
      await updateRating(db, domain, flag);
    } else {
      // Insert a new domain
      await insertRating(db, domain, flag);
    }
  } catch (err) {
    console.error(`Error updating or inserting rating: ${err.message}`);
    throw err;
  } finally {
    db.close();
  }
}

/**
 * Opens the SQLite database.
 * @param {string} dbPath - The path to the database file.
 * @returns {sqlite3.Database} - The database instance.
 */
function openDatabase(dbPath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err)
        reject(new Error(`Failed to connect to database: ${err.message}`));
      else resolve(db);
    });
  });
}

/**
 * Retrieves the row for a given domain.
 * @param {sqlite3.Database} db - The database instance.
 * @param {string} domain - The domain to query.
 * @returns {Promise<Object|null>} - The row for the domain, or null if not found.
 */
function getDomainRow(db, domain) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM domains WHERE domain_name = ?`,
      [domain],
      (err, row) => {
        if (err) reject(new Error(`Failed to query domain: ${err.message}`));
        else resolve(row);
      }
    );
  });
}

/**
 * Updates the rating for an existing domain.
 * @param {sqlite3.Database} db - The database instance.
 * @param {string} domain - The domain to update.
 * @param {boolean} flag - If true, increment positive ratings; otherwise, increment negative ratings.
 * @returns {Promise<void>} - Resolves when the update is complete.
 */
function updateRating(db, domain, flag) {
  const column = flag ? "positive_reports" : "negative_reports";
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE domains SET ${column} = ${column} + 1 WHERE domain_name = ?`,
      [domain],
      function (err) {
        if (err) reject(new Error(`Failed to update domain: ${err.message}`));
        else resolve();
      }
    );
  });
}

/**
 * Inserts a new row for the domain.
 * @param {sqlite3.Database} db - The database instance.
 * @param {string} domain - The domain to insert.
 * @param {boolean} flag - If true, set positive ratings to 1; otherwise, set negative ratings to 1.
 * @returns {Promise<void>} - Resolves when the insertion is complete.
 */
function insertRating(db, domain, flag) {
  const goodRatings = flag ? 1 : 0;
  const badRatings = flag ? 0 : 1;
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO domains (domain_name, negative_reports, positive_reports) VALUES (?, ?, ?)`,
      [domain, badRatings, goodRatings],
      function (err) {
        if (err) reject(new Error(`Failed to insert domain: ${err.message}`));
        else resolve();
      }
    );
  });
}
