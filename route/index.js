/**
 * Created by terryshek on 11/12/14.
 */
var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var user = require("../model/userDb");
/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});

module.exports = router;
