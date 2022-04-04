var express = require('express');
var router = express.Router();

/* GET home page. */
function indexf(req, res, next) {
    res.render('index', { title: '12345' });
}
router.get('/', indexf);

module.exports = router;
// database test
var mysql = require('mysql');
var db_info = {
    host: 'localhost',
    user: 'ankertim',
    password: '1234',
    database:'dcard_intern',
    port: 3306
}
var connection = mysql.createConnection(db_info);
connection.connect();
var query = {
    sql: 'SELECT * FROM shorturl',
    timeout: 40000
}
connection.query(query, function(err, rows, fields) {
    if (err) throw err;
    console.log('The result is: ', rows);
});
connection.end();