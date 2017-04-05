var bodyParser = require('body-parser');
var express = require('express');
var database = require('./database');
var router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));

router.post('/register', function(req, res){
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
});

module.exports = router;