var bodyParser = require('body-parser');
var express = require('express');
var database = require('./database');
var router = express.Router();
var fs = require('fs');
var session = require('express-session');
var sessionConfig = require('./sessionConfig');

var loginHTMLpath = './Web/public/register.html';

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));

// authenticate session before login
var authenticateSession = function(req, res, next){
    if(req.session.username){
        res.redirect('/private/dashboard');
        return;
    }
    next();
}

router.use(session(sessionConfig));

var authenticate = function(err, req, userdata){
    if(err || userdata == null || userdata.password !== req.body.password){
        return false;
    }
    return true;
};

router.post('/login', authenticateSession, function(req, res){
    var nextAction = function(userdata){
        var data;
        if(userdata !== null){
            req.session.username = userdata.username;
            data = {success: true, url: '/private/dashboard'};
        }else{
            data = {success: false, url:'#', message: 'username/email and password combination not found!'};
        }
        res.send(data);
    }

    // authenticate email, or username
    database.findUserWithEmail(req.body.username, function(err, userdata){
        if(authenticate(err, req, userdata)){
            return nextAction(userdata);
        }
        database.findUserWithUsername(req.body.username, function(err, userdata){
            if(authenticate(err, req, userdata)){
                return nextAction(userdata);
            }
            return nextAction(null);
        });
    });
});

router.get('/login', function(req, res){
    var readStream = fs.createReadStream(loginHTMLpath);
    readStream.pipe(res);
    readStream.on('error', function(){
        res.redirect('/404');
    })
});

router.get('/logout', function(req, res){
    if(req.session.username){
        req.session.destroy();
    }
    res.redirect('/login');
});

module.exports = router;