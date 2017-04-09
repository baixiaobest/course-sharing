var bodyParser = require('body-parser');
var express = require('express');
var async = require('async');
var database = require('./database');
var router = express.Router();
var fs = require('fs');
var session = require('express-session');
var sessionConfig = require('./sessionConfig');
var bcrypt = require('bcrypt');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));
router.use(session(sessionConfig));

// prestore register html
var registerHTMLpath = './Web/public/register.html';
var registerHtml=null;
fs.readFile(registerHTMLpath, function(err, data){
    registerHtml = data;
});

var usernameExits = function(res){
    res.send({success: false, message: 'Username already exists'});
};

var emailExists = function(res){
    res.send({success: false, message: 'Email already exists'});
};

var passwordInValid = function(res){
    res.send({success: false, message: 'Invalid password'});
};

var registerationSucceeds = function(req, res, userdata){
    req.session.username = userdata.username;
    bcrypt.hash(userdata.password, 10, function(err, hash){
        if(err){
            return console.log('password hashing error');
        }
        userdata.password = hash;
        database.addUser(userdata, function(err){
            if(err){
                console.log('database error');
            }
        });
        res.send({success: true, url: '/private/dashboard'});
    });
}

router.post('/register', function(req, res){
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;

    async.series([
        function(callback){
            database.findUserWithUsername(username, function(err, userdata){
                if(err || userdata !== null){
                    callback('failed');
                    return usernameExits(res);
                }
                callback(null);
            }); 
        }, 
        function(callback){
            database.findUserWithEmail(email, function(err, userdata){
                if(err || userdata !== null){
                    callback('failed');
                    return emailExists(res);
                }
                callback(null);
            });
        },
        function(callback){
            if(password.length < 6){
                callback('failed');
                return passwordInValid(res);
            }
            callback(null);
        }
    ], function(err, result){
        if(!err)
            registerationSucceeds(req, res, {username: username, email:email, password:password});
    });
});

router.get('/register', function(req, res){
    var readStream = fs.createReadStream(registerHTMLpath);
    readStream.pipe(res);
    readStream.on('error', function(){
        res.redirect('/404')
    })
    // sendRegisterHtmlWithAlert(res, null);
});

module.exports = router;