var bodyParser = require('body-parser');
var express = require('express');
var database = require('./database');
var router = express.Router();
var cheerio = require('cheerio');
var fs = require('fs');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));

// pre store the login page for dynamic content modification
var loginHTMLpath = './Web/public/register.html';
var loginHtml=null;
fs.readFile(loginHTMLpath, function(err, data){
    loginHtml = data;
});

var authenticate = function(err, req, userdata){
    if(err || userdata == null || userdata.password !== req.body.password){
        return false;
    }
    return true;
};

var sendLoginHtmlWithAlert = function(res, message){
    if(loginHtml == null)
        setImmediate(sendLoginHtmlWithAlert);
    $ = cheerio.load(loginHtml);
    // display alert
    $('.alert').css('display', 'block');
    $('.alert').text(message);
    res.send($.html());
}

router.post('/login', function(req, res){
    var nextAction = function(userdata){
        if(userdata !== null){
            res.send('Welcome '+userdata.username);
        }else{
            sendLoginHtmlWithAlert(res, 'username/email and password combination not found!');
        }
    }

    // authenticate email, or username
    database.findUserWithEmail(req.body.username, function(err, userdata){
        if(authenticate(err, req, userdata)){
            return next(userdata);
        }
        database.findUserWithUsername(req.body.username, function(err, userdata){
            if(authenticate(err, req, userdata)){
                return next(userdata);
            }
            return nextAction(null);
        });
    });
});

module.exports = router;