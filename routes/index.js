var express = require('express');
var router = express.Router();
var global_a;

/* GET home page. */
function indexPage(req, res, next) {
    res.render('index', { title: '生成短網址網站' });
}
router.get('/', indexPage);

/* GET shorturl page */
function get_urlPage(req, res, next) {
    res.render('urlPage', { title: '短網址生成工具' });
}
router.get('/api/urls', get_urlPage);
/*
// database setting
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
    sql: 'SELECT * FROM shorturl'
}
function callback(error, rows, fields) {
    if (error) throw error;
    global_a = rows;
    console.log('The result is: ', rows);
    console.log('type of result is: ', typeof(rows));
}
connection.query(query, callback);
console.log('The result: ', global_a);
connection.end();
*/
//===========================================================
// create pool
var mysql = require('mysql');
var db_info = {
  host: 'localhost',
  user: 'ankertim',
  password: '1234',
  database:'dcard_intern',
  port: 3306,
  dateStrings: true
}
var pool = mysql.createPool(db_info);

// function  
function urlCallback(req, res) {
  console.log('Hello AAAA: ', req.body.orig_url);
  var query = {
    sql: 'SELECT * FROM shorturl'
    //url: req.body.orig_url
  }
  
  function dbCallback(error, results, fields) {
    if (error) throw error;
    console.log('The result is: ', results);
    console.log('Hello AAA: ');
  }

  pool.getConnection(
    function(err, connection) { 
      connection.query(query, dbCallback) //(error, rows, fields)
    }
  );
  /*
  //新增完成後，查詢目前所有使用者
  connection.query('select * from users', function(err, rows, field){
      if (err)
          throw err;
          console.log('Hello BBB: ');
      //將資料傳送到首頁的使用者列表
      res.render('user', {
          title: '使用者列表',
          user: rows
      });
  });
  */
  res.render('urlPage', { title: '短網址生成工具' });
  connection.release();
}
router.post('/convert', urlCallback)

module.exports = router;