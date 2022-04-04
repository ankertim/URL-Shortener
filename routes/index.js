var express = require('express');
var router = express.Router();

/* GET home page. */
function indexf(req, res, next) {
    res.render('index', { title: '生成短網址工具' });
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
    port: 3306,
    dateStrings: true
}
var connection = mysql.createConnection(db_info);
connection.connect();
var query = {
    sql: 'SELECT * FROM shorturl',
    timeout: 40000,
}
function callback(error, rows, fields) {
    if (error) throw error;
    console.log('The result is: ', rows);
    console.log('type of result is: ', typeof(rows));
}
connection.query(query, callback);
connection.end();
// use pool
var pool = mysql.createPool(db_info);