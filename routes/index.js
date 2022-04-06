const express = require('express');
const router = express.Router();
const validUrl = require('valid-url');
const shortId = require('shortid');
const util = require('util');

var urlCode = undefined;
var systemDate = new Date();
var expireDay = new Date();
var expireDay_year, expireDay_month, expireDay_date;
var expireDay_wb_db;
var db_rt_expireDay;
var global_results;

// use addDays function: Date.addDays(10), Date will be add 10 days, Date is type of new Date().
Date.prototype.addDays = function(days) {
  this.setDate(this.getDate() + days);
  return this;
}

// create pool
var mysql = require('mysql');
var db_info = {
  host: 'localhost',
  user: 'ankertim',
  password: '1234',
  database:'dcard_intern',
  port: 3306,
  // if true date will be 2022-04-06
  dateStrings: true
}
var pool = mysql.createPool(db_info);

// pool.query() is a shortcut for pool.getConnection() + connection.query() + connection.release().
const promiseQuery = util.promisify(pool.query).bind(pool);
const promisePoolEnd = util.promisify(pool.end).bind(pool);

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

/* Redirect url */
router.get('/:code', async (req, res, next) => {
  try {
    const urlCode = req.params.code;
    // set up query function
    const mySqlQuery = () => {
      return new Promise((resolve, reject) => {
        // set up query instruction
        var query_sql = {
          sql: "SELECT * FROM `shorturl` where `urlCode` = " + "'" + urlCode + "'" //  use escape if can use
          //sql: "SELECT * FROM `shorturl`"
        }
        // set up db Callback function
        function dbCallback(error, results, fields) {
          // handle error
          if (error) throw error;
          resolve(results);
        }
        // call query to database
        promiseQuery(query_sql, dbCallback);
      })
    }
    global_results = await mySqlQuery();
    if (typeof(global_results[0].orig_url) == "string") {
      // Redirect to orig_url
      console.log("database has orig_url");
      console.log("global_results: ", global_results);
      // show db orig_url
      console.log("Get db orig_url: ", global_results[0].orig_url);
      console.log("Typeof orig_url is: ", typeof(global_results[0].orig_url));
      // show db expire date
      console.log("Get expire date: ", global_results[0].expire_date)
      console.log("Type of expire date is: ", typeof(global_results[0].expire_date));
      // vaild expire date
      db_rt_expireDay = new Date(global_results[0].expire_date);
      console.log("Now Date: ", systemDate);
      console.log("Expire Date: ", db_rt_expireDay);
      console.log("vaild short url:" , db_rt_expireDay >= systemDate);
      // if short url has not expired, redirect url, else 404 Invaild! 
      if (db_rt_expireDay >= systemDate) {
        res.redirect(global_results[0].orig_url);
      } else {
        res.status(404).json("Invaild! This short url has expired.");
      }
    } else {
      res.status(404).json("No url found");
    }
  } catch (error) {
    res.status(500).json("Server error");
  }
});

// async function for post callback about user generate short url 
const urlCallback = async function(req, res) {
  const long_url = req.body.orig_url;
  console.log('User type url is: ', long_url);
  // vaild user type url
  if (validUrl.isUri(long_url)) {
    // query to database
    try {
      // set up query function
      const mySqlQuery = () => {
        return new Promise((resolve, reject) => {
          // set up query instruction
          var query_sql = {
            sql: "SELECT * FROM `shorturl` where `orig_url` = " + "'" + long_url + "'" //  use escape if can use
            //sql: "SELECT * FROM `shorturl`"
          }
          // set up db Callback function
          function dbCallback(error, results, fields) {
            // handle error
            if (error) throw error;
            resolve(results);
          }
          // call query to database
          promiseQuery(query_sql, dbCallback);
        })
      }
      // call query function
      global_results = await mySqlQuery();
      // show db return data
      console.log('The global results is: ', global_results);
      console.log('Type of results is: ', typeof(global_results));
      // if database do not have orig_url that user type, convert short urlCode and insert into db.
      if (typeof(global_results[0]) == "undefined") {
        console.log('User type url is undefined');
        // show today
        console.log(systemDate);
        // set up expireDay for today add 10 days.
        expireDay.addDays(10);
        // get expireDay year, month and date.
        expireDay_year = expireDay.getFullYear();
        expireDay_month = expireDay.getMonth() + 1;
        if (expireDay_month < 10) expireDay_month = "0" + expireDay_month; // if month = 4 will -> 04, change type to string.
        console.log(typeof(expireDay_month));
        expireDay_date = expireDay.getDate();
        // set up expireDay wirte back database string format.
        expireDay_wb_db = expireDay_year + "-" + expireDay_month + "-" + expireDay_date;
        // show expireDay
        console.log("expireDay_wb_db: ", expireDay_wb_db);
        // generate shortid
        urlCode = undefined;
        urlCode = shortId.generate();
        console.log("urlCode", urlCode);
        // set up query
        const mySqlQuery = () => {
          return new Promise((resolve, reject) => {
            // set up query instruction
            var query_sql = {
              sql: "INSERT INTO `shorturl` VALUES(?, ?, ?)",
              values: [urlCode, long_url, expireDay_wb_db] // if can use escape, just use
            }
            // set up db Callback function
            function dbCallback(error, results, fields) {
              // handle error
              if (error) throw error;
              resolve(results);
            }
            // call query to database
            promiseQuery(query_sql, dbCallback);
          })
        }
        global_results = await mySqlQuery();
        // show db return data
        console.log('The global results is: ', global_results);
        console.log('Type of results is: ', typeof(global_results));
              values: [urlCode, long_url, expireDay_wb_db] // if can use escape, just use
        res.render('urlPage', { title: '短網址生成工具',
                                db_urlCode: urlCode,
                                db_orig_url: long_url,
                                db_expire_date: expireDay_wb_db});
      } else { 
        urlCode = undefined;
        urlCode = global_results[0].urlCode;
        console.log('urlCode: ', urlCode);
        console.log('Database has orig_url');
        res.render('urlPage', { title: '短網址生成工具',
                                db_urlCode: urlCode,
                                db_orig_url: long_url,
                                db_expire_date: global_results[0].expire_date});
      }
    } catch (error) {
      console.log(error);
      res.status(500).json('Sever error');
    } finally {
      //promisePoolEnd();
    }
  } else {
    res.status(401).json('Invalid long url');
  }
}
router.post('/api/urls', urlCallback)
module.exports = router;