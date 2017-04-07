var bodyParser = require('body-parser');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var sessionConfig = require('./sessionConfig');
var session = require('express-session');
var database = require('./database');

router.use(bodyParser.json());

var authenticateSession = function(req, res, next){
    if(!req.session.username){
        res.redirect('/404');
    }else{
        req.session.maxAge = sessionConfig.cookie.maxAge;
        next();
    }
};

var sendFile = function(res, path){
    var filestream = fs.createReadStream(path);
    filestream.pipe(res);
    filestream.on('error', function(){
        console.log('cannot find dashboard.html');
    });
};

router.use(session(sessionConfig));
router.use(authenticateSession);

router.get('/private/dashboard', function(req, res){
    sendFile(res, './Web/private/dashboard.html');
});

router.get('/private/profile', function(req, res){
    sendFile(res, './Web/private/profile.html');
});

router.get('/private/ajax/username', function(req, res){
    res.json({username:req.session.username});
});

router.get('/private/ajax/userProfile', function(req, res){
    database.findUserWithUsername(req.session.username, function(err, userdata){
        if(err || userdata==null){
            return console.log('/private/ajax/userprofile failed for '+req.session.username);
        }
        userdata.password = '';
        res.send(userdata);
    });
});

router.post('/private/ajax/updateProfile', function(req, res){
    var name = req.body.name;
    var username = req.body.username;
    var email = req.body.email;
    var school = req.body.school;
    var newProfile= {name:name, username: username, email: email, school: school};

    // update database
    var updateProfile = function(){
        database.updateUser(req.session.username, newProfile, function(err){
            if(err){
                return res.send({success: false, message: err});
            }
            req.session.username = username;
            res.send({success: true});
        });
    }

    // check name conflict
    if(username != req.session.username){
        database.findUserWithUsername(username, function(err, userdata){
            if(err || userdata !== null){
                return res.send({success: false, message: 'username exists'});
            }
            updateProfile();
        }); 
    }else{
        updateProfile();
    }
    
});


router.post('/private/ajax/updatePassword', function(req, res){
    var username = req.session.username;
    var oldPassword = req.body.oldPassword;
    var newPassword = req.body.newPassword;
    database.findUserWithUsername(req.session.username, function(err, userdata){
        if(err || userdata == null){
            return console.log('/private/ajax/updatePassword failed for '+username);
        }
        if(userdata.password !== oldPassword){
            res.send({success:false, message: 'Old password does not match'});
        }else{
            database.updatePassword(username, newPassword, function(err){
                if(err){
                    return console.log('updatePassword failed');
                } 
                res.send({success: true});
            });
        }
    });
});

module.exports = router;