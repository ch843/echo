// THIS WILL BE OUR EXPRESS APP FILE!! (like index.js)
const express = require('express');
let path = require("path");
const session = require('express-session');

const knex = require("knex") ({
    // pass parameters to it
    client: "pg",
    connection: {
        host: "localhost",
        user: "postgres",
        password: "admin",
        database: "echo",
        port: 5432
    }
});

const app = express();
const port = 3000;

app.set('view engine', 'ejs')

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));

// ------ ROUTES ------
app.get('/', (req, res) => {
  res.render('pages/index', { loggedin: req.session.loggedin })
})

app.get('/login', (req, res) => {
  if (req.session.loggedin) {
    res.render('pages/login', { msg: "success", loggedin: req.session.loggedin })
  }
  else {
    res.render('pages/login', { msg: "", loggedin: req.session.loggedin })
  }
})

app.get('/journal', (req, res) => {
    res.render('pages/journal', { loggedin: req.session.loggedin })
})

app.get('/history', (req, res) => {
  res.render('pages/history', { loggedin: req.session.loggedin, username: req.session.username })
})

app.get('/createUser', (req, res) => {
  res.render('pages/createUser', { loggedin: req.session.loggedin, msg: ""})
})
// ----- DATABASE CALLS --------
//  route for verifying user
app.get('/validate', async (req, res) => {
  const usernameToCheck = req.body.username ? req.body.username : '';
  const passwordToCheck = req.body.password ? req.body.password : '';
  try {
    if (usernameToCheck && passwordToCheck) {
      const user = await knex.from('users').select('userID', 'username').where({ username: usernameToCheck, password: passwordToCheck }).first();

      if (user) {
        req.session.loggedin = true;
        req.session.username = user.username;
        req.session.userID = user.userID
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
    res.render('pages/createAccount', { msg: 'error', loggedin: req.session.loggedin });
  }
  else if (passwordOne != passwordTwo) {
    res.render('pages/createAccount', { msg: 'password', loggedin: req.session.loggedin });
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
    let result = knex.from('survey_info').select('entryDate', 'entryTitle').where({ userID: req.session.userID });
    res.render('pages/surveyResults', { loggedin: req.session.loggedin, entries: result });
});


app.post('/addEntry', async (req, res) => {
  // add journal entry to entries table

});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
