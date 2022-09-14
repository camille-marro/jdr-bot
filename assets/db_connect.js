const mysql = require("mysql");

let connection = mysql.createConnection({
    host: 'mysql-camille-marro.alwaysdata.net',
    user: '232065_bot-jdr',
    password: 'CbVru8A34',
    database: 'camille-marro_bdd'
});

connection.connect(function(err) {
    if (err) {
        return console.error('error: ' + err.message);
    }
    console.log('Connected to database');
});

module.exports = connection;