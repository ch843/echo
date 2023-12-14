// THIS WILL BE OUR EXPRESS APP FILE!! (like index.js)
const express = require('express');
let path = require("path");
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

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

app.get('/history', async (req, res) => {
  try {
    let result = await knex.from('journal').select('entryid', 'entrydate', 'entrytitle').where({ username: req.session.username });
    res.render('pages/history', { loggedin: req.session.loggedin, username: req.session.username, entries: result });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/createUser', (req, res) => {
  res.render('pages/createUser', { loggedin: req.session.loggedin, msg: ""});
});

app.get('/logout', (req, res) => {
  delete req.session.username;
  delete req.session.password;
  delete req.session.status;
  delete req.session.loggedin;
  res.render('pages/login', { msg: "logout", loggedin: req.session.loggedin });
});

// ----- DATABASE CALLS --------
app.post('/validate', async (req, res) => {
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


app.post('/create', async (req, res) => {
  const usernameToCheck = req.body.username ? req.body.username : '';
  const passwordOne = req.body.password ? req.body.password : '';
  const passwordTwo = req.body.confirmPassword ? req.body.confirmPassword : '';
  req.session.loggedin = false;
  
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


app.post('/addEntry', async (req, res) => {
  // add journal entry to entries table
  await knex.from("journal").insert({
    entrydate: req.body.date,
    entrytitle: req.body.title,
    response1: req.body.response1,
    response2: req.body.response2,
    response3: req.body.response3,
    username: req.session.username
  }).then(entry => {
    res.redirect('/history');
  }).catch(error => {
    console.error(error);
  });
});

app.get("/delete/:entryid", async(req, res)=> {
  try {
    await knex("journal").where({ entryid: req.params.entryid }).del();
    res.redirect("/history");
  } catch (err) {
    console.error(err);
    res.status(500).json({ err });
  }
});

app.get("/view/:entryid", async(req, res)=> {
  let entry = await knex("journal").where({ entryid: req.params.entryid })
  res.render("pages/entry", { entry: entry})
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
