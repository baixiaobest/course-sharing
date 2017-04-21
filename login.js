var bodyParser = require('body-parser');
var express = require('express');
var database = require('./database');
var router = express.Router();
var fs = require('fs');
var session = require('express-session');
var sessionConfig = require('./sessionConfig');
var bcrypt = require('bcrypt');
var async = require('async');

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

var authenticate = function(err, req, userdata, callback){
    if(err || userdata == null){
        return callback(false);
    }
    bcrypt.compare(req.body.password, userdata.password, function(err, result){
        if(err)
            return callback(false);
        callback(result);
    });
    return true;
};

router.post('/login', authenticateSession, function(req, res){
    var username = req.body.username.toLowerCase();

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

    async.series([
        function(callback){
            database.findUserWithEmail(username, function(err, userdata){
                authenticate(err, req, userdata, function(result){
                    if(result)
                        return nextAction(userdata);
                    callback(null);
                });
            });
        },
        function(callback){
            database.findUserWithUsername(username, function(err, userdata){
                authenticate(err, req, userdata, function(result){
                    if(result)
                        return nextAction(userdata);
                    callback(null);
                });
            });
        }
    ], function(err, result){
        nextAction(null);
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