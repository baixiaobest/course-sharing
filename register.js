var bodyParser = require('body-parser');
var express = require('express');
var async = require('async');
var database = require('./database');
var router = express.Router();
var cheerio = require('cheerio');
var fs = require('fs');
var session = require('express-session');
var sessionConfig = require('./sessionConfig');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));
router.use(session(sessionConfig));

// prestore register html
var registerHTMLpath = './Web/public/register.html';
var registerHtml=null;
fs.readFile(registerHTMLpath, function(err, data){
    registerHtml = data;
});

// dependency on html content, this function should be deleted
var sendRegisterHtmlWithAlert = function(res, message){
    if(registerHtml == null)
        setImmediate(sendRegisterHtmlWithAlert);
    $ = cheerio.load(registerHtml);
    
    // display alert
    if(message != null){
        $('.alert').css('display', 'block');
        $('.alert').text(message);
    }
    // select register tag
    $('#login-form-link').removeClass('active');
    $('#register-form-link').addClass('active');
    // display register form
    $("#login-form").css('display', 'none');
    $("#register-form").css('display', 'block');

    res.send($.html());
};

var usernameExits = function(res){
    sendRegisterHtmlWithAlert(res, 'Username already exists');
};

var emailExists = function(res){
    sendRegisterHtmlWithAlert(res, 'Email already exists');
};

var passwordInValid = function(res){
    sendRegisterHtmlWithAlert(res, 'Invalid password');
};

var registerationSucceeds = function(req, res, userdata){
    req.session.username = userdata.username;
    database.addUser(userdata, function(err){
        if(err){
            console.log('database error');
        }
    });
    res.redirect('/private/dashboard');
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
    sendRegisterHtmlWithAlert(res, null);
});

module.exports = router;