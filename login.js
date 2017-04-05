var bodyParser = require('body-parser');
var express = require('express');
var database = require('./database');
var router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));

var authenticate = function(err, req, userdata){
    if(err || userdata == null || userdata.password !== req.body.password){
        return false;
    }
    return true;
};

router.post('/login', function(req, res){
    var next = function(userdata){
        if(userdata !== null){
            res.send('Welcome '+userdata.username);
        }else{
            res.redirect('register.html');
        }
    }

    database.findUserWithEmail(req.body.username, function(err, userdata){
        if(authenticate(err, req, userdata)){
            return next(userdata);
        }
        database.findUserWithUsername(req.body.username, function(err, userdata){
            if(authenticate(err, req, userdata)){
                return next(userdata);
            }
            return next(null);
        });
    });
});

module.exports = router;