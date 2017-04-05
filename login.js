var bodyParser = require('body-parser');
var express = require('express');
var database = require('./database');
var router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));

var authenticate = function(err, req, res, userdata, callback){
    if(err || userdata == null || userdata.password !== req.body.password){
            if(callback !== null)
                callback();
            else
                res.send("authentication failed");
            return;
    }
    res.send('Welcome '+userdata.username);
};

router.post('/login', function(req, res){
    database.findUserWithEmail(req.body.email, function(err, userdata){
        authenticate(err, req, res, userdata, function(){
            database.findUserWithUsername(req.body.email, function(err, userdata){
                authenticate(err, req, res, userdata, null);
            });
        });
    });
});

module.exports = router;