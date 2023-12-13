// THIS WILL BE OUR EXPRESS APP FILE!! (like index.js)
const express = require('express');
let path = require("path");
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;
app.set('view engine', 'ejs');

const knex = require("knex") ({
    client: "pg",
    connection: {
      host: process.env.RDS_HOSTNAME || 'localhost', // name of host, on AWS use the one they give 
      user:  process.env.RDS_USERNAME || 'postgres', // name of user w/ permissions on database 
      password: process.env.RDS_PASSWORD || 'admin',
      database:  process.env.RDS_DB_NAME || 'echo', // name of database on postgres
      port:  process.env.RDS_PORT || 5432, // port number for postgres (postgres > properties > connection > port)
      ssl: process.env.DB_SSL_INTEX ? {rejectUnauthorized: false} : false
    }
});

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));

// ------ ROUTES ------
app.get('/', (req, res) => {
  res.render('pages/index', { loggedin: req.session.loggedin });
});

app.get('/login', (req, res) => {
  if (req.session.loggedin) {
    res.render('pages/login', { msg: "success", loggedin: req.session.loggedin });
  }
  else {
    res.render('pages/login', { msg: "", loggedin: req.session.loggedin });
  };
});

app.get('/journal', (req, res) => {
    res.render('pages/journal', { loggedin: req.session.loggedin });
});

app.get('/history', (req, res) => {
  res.render('pages/history', { loggedin: req.session.loggedin, username: req.session.username, entries: req.session.entries });
});

app.get('/createUser', (req, res) => {
  res.render('pages/createUser', { loggedin: req.session.loggedin, msg: ""});
});

// ----- DATABASE CALLS --------
app.get('/validate', async (req, res) => {
  const usernameToCheck = req.body.username ? req.body.username : '';
  const passwordToCheck = req.body.password ? req.body.password : '';
  try {
    if (usernameToCheck && passwordToCheck) {
      const user = await knex.from('users').select('username').where({ username: usernameToCheck, password: passwordToCheck }).first();

      if (user) {
        req.session.loggedin = true;
        req.session.username = user.username;
        res.redirect('/history');
      } else {
        res.render('pages/login', { msg: "error", loggedin: req.session.loggedin });
      };
    };
  } catch (error) {
    console.error('Error validating user:', error);
    res.status(500).send('Internal Server Error');
  };
});


app.get('/create', async (req, res) => {
  const usernameToCheck = req.body.username ? req.body.username : '';
  const passwordOne = req.body.password ? req.body.password : '';
  const passwordTwo = req.body.newPassword ? req.body.newPassword : '';
  let user = await knex.from('users').where({ username: usernameToCheck }).first();

  if (user) {
    res.render('pages/createUser', { msg: 'error', loggedin: req.session.loggedin });
  }
  else if (passwordOne != passwordTwo) {
    res.render('pages/createUser', { msg: 'password', loggedin: req.session.loggedin });
  }
  else {
    knex.from("users").insert({
      username: req.body.username,
      password: req.body.password
    }).then(entry => {
      res.redirect('/login');
    }).catch(error => {
      console.error(error);
    });
  };
});

app.get('/logout', (req, res) => {
  delete req.session.username;
  delete req.session.password;
  delete req.session.status;
  delete req.session.loggedin;
  res.render('pages/login', { msg: "logout", loggedin: req.session.loggedin });
});

app.get('/getEntries', async (req, res) => {
    // dynamically generate a table for past journal entries (just title and date)
    let result = knex.from('journal').select('entryDate', 'entryTitle').where({ username: req.session.username });
    req.session.entries = result;
    res.render('/history');
});


app.post('/addEntry', async (req, res) => {
  // add journal entry to entries table
  knex.from("journal").insert({
    username: req.session.username,
    entryDate: req.body.date,
    entryTitle: req.body.title,
    response1: req.body.response1,
    response2: req.body.response2,
    response3: req.body.response3
  }).then(entry => {
    res.redirect('/history');
  }).catch(error => {
    console.error(error);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
