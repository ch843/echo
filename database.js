// how we connect with pg admin database
// call these functions from other js files to interact with db

const { Pool } = require('pg');

const pool = new Pool({
  user: 'pgadmin',
  host: 'your_host',
  database: 'echo',
  password: 'admin',
  port: 5432,
});

// get user information when logging in (to verify user status)
async function verifyUser() {
    return;
};

// create user to add to database
async function createUser() {
    return;
};

// gets all journal entries to display on journal entry page
async function getEntries(userID) {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM journal WHERE userID = $1', [userID]);
      return result.rows;
    } finally {
      client.release();
    }
}

// posts journal entry to database
async function postEntry(userID, entryDate, title, response1, response2, response3) {
    const client = await pool.connect();
    try {
      const result = await client.query('INSERT INTO journal (entryDate, title, response1, response2, response3, userID) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [entryDate, title, response1, response2, response3, userID]);
      return result.rows[0];
    } finally {
      client.release();
    }
}

// gets all journal entries that match title of entry that user is searching for
// searchTitle will be passed in as a string of the title the user is searching
async function searchEntries(userID, searchTitle) {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM journal WHERE title LIKE $1 AND userID = $2', [searchTitle, userID]);
      return result.rows;
    } finally {
      client.release();
    }
}
  
module.exports = {
    searchEntries,
    getEntries,
    postEntry,
    verifyUser,
    createUser
};