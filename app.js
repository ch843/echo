const express = require('express');
const db = require('./db');

const app = express();
const port = 3000;

//  route for verifying user
app.get('/login', async (req, res) => {
    db('user')
    // fill in with the values we need to query
    .where({ username: username, password: password })
    .select('*')
    .then(entries => {
      res.status(200).json(entries);
    })
    .catch(error => {
      console.error('Error retrieving user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

//  route for creating user
app.get('/create', async (req, res) => {
    // Insert the new user into the 'user' table
    db('user')
    // can insert whatever columns we need
    .insert({ username: username, password: password})
    .returning('*')
    .then(rows => {
        res.status(201).json(rows[0]);
    })
    .catch(error => {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    });
});

// route for getting all journal entries from database
app.get('/history', async (req, res) => {
    const userID = localStorage.getItem("userID");
    
    db('journal')
    .where({ userID: userID })
    .select('*')
    .then(entries => {
      res.status(200).json(entries);
    })
    .catch(error => {
      console.error('Error retrieving journal entries:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

// route for posting a journal entry to database
app.post('/journal', async (req, res) => {
    const userID = localStorage.getItem("userID");
    // add title, entryDate, response1, response2, response3 as get element by ID from html form

    // Insert the new journal entry into the 'journal' table
    db('journal')
    .insert({ userID: userID, entryDate: entryDate, title: title, response1: response1, response2: response2, response3: response3})
    .returning('*')
    .then(rows => {
        res.status(201).json(rows[0]);
    })
    .catch(error => {
        console.error('Error creating journal entry:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    });
});

// route for searching for entries
app.get('/search', async (req, res) => {
    const userID = localStorage.getItem("userID");
    const title = '';
    // get title from search bar (get element by id) to grab string value
    
    db('journal')
    .where({ userID: userID })
    .whereILike({title: `${title}`})
    .select('*')
    .then(entries => {
      res.status(200).json(entries);
    })
    .catch(error => {
      console.error('Error searching for journal entries:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });

});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
