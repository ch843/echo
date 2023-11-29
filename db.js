// connect to database
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

module.exports = db;