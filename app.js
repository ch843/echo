const express = require('express');
const { searchEntries, getEntries, postEntry, verifyUser, createUser } = require('./database.js'); // Replace with the actual path to your db.js file

const app = express();
const port = 3000;

//  route for verifying user
app.get('/login', async (req, res) => {
    // use verifyUser() function
});

//  route for creating user
app.get('/createUser', async (req, res) => {
    // use createUser() function
});

// route for getting all journal entries from database
app.get('/entries', async (req, res) => {
    try {
        const userID = localStorage.getItem("userID");
        const entries = await getEntries(userID);
        res.json(entries);
    } catch (error) {
        console.error('Error fetching entries:', error);
        res.status(500).send('Internal Server Error');
    }
});

// route for posting a journal entry to database
app.post('/createEntry', async (req, res) => {
    try {
        const userID = localStorage.getItem("userID");
        // add title, entryDate, response1, response2, response3 as get element by ID from html form
        const newEntry = await postEntry(userID, entryDate, title, response1, response2, response3);
        res.json(newEntry);
    } catch (error) {
        console.error('Error fetching entries:', error);
        res.status(500).send('Internal Server Error');
    }
});

// route for searching for entries
app.get('/search', async (req, res) => {
    try {
        // add a document.getElementByID here to get searchTitle
        const userID = localStorage.getItem("userID");
        const results = await searchEntries(userID, searchTitle);
        res.json(results);
    } catch (error) {
        console.error('Error fetching entries:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
