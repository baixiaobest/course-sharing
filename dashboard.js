var bodyParser = require('body-parser');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var sessionConfig = require('./sessionConfig');
var session = require('express-session');
var database = require('./database');
var bcrypt = require('bcrypt');

router.use(bodyParser.json());

var authenticateSession = function(req, res, next){
    if(!req.session.username){
        res.redirect('/404');
    }else{
        // update cookie and send it back
        // so session can be extended
        req.session.timestamp = Date.now();
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

router.get('/private/upload', function(req, res){
    sendFile(res, './Web/private/upload.html');
});


////////////////////////////////
/////////     AJAX    //////////
////////////////////////////////

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
        bcrypt.compare(oldPassword, userdata.password, function(err, result){
            if(!result)
                return res.send({success:false, message: 'Old password does not match'});
            bcrypt.hash(newPassword, 10, function(err, hash){
                database.updatePassword(username, hash, function(err){
                    if(err)
                        return console.log('password update failed');
                    res.send({success: true});
                });
            });
        });
    });
});


router.post('/private/ajax/uploadFiles', function(req, res){
    res.send({success:true});
});

module.exports = router;