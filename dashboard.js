var bodyParser = require('body-parser');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var sessionConfig = require('./sessionConfig');
var session = require('express-session');
var database = require('./database');
var bcrypt = require('bcrypt');
var async = require('async');
var path = require('path');
var aws = require('aws-sdk');

router.use(bodyParser.json());

var S3_BUCKET = process.env.S3_BUCKET;
var S3_BUCKET_LOCATION = process.env.S3_BUCKET_LOCATION;
aws.config = new aws.Config();
aws.config.accessKeyId = process.env.AWS_ACCESS_KEY_ID
aws.config.secretAccessKey = process.env.AWS_SECRETE_KEY;

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

var sendFile = function(res, path, callback){
    var filestream = fs.createReadStream(path);
    filestream.pipe(res);
    filestream.on('error', function(){
        console.log('cannot find '+path);
        callback('cannot find file');
    });
};

router.use(session(sessionConfig));
router.use(authenticateSession);

router.get('/private/:privateFile', function(req, res){
    sendFile(res, './Web/private/'+req.params.privateFile+'.html', 
        function(err){
            if(err)
                res.redirect('/404');
        }
    );
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

router.get('/private/ajax/uploadAuthorization', function(req, res){
    var s3 = new aws.S3();

    var filename = req.query['filename'];
    var fileType = req.query['fileType'];

    var s3Params = {
        Bucket: S3_BUCKET,
        Key: filename,
        Expires: 300,
        ContentType: fileType,
        ACL: 'public-read'
    };
    s3.getSignedUrl('putObject', s3Params, function(err, data){
        if(err){
            console.log(err);
            return res.send({success:false, message: 'Upload not authorized'});
        }
        var retData = {
            success: true,
            signedRequest: data,
            url: 'https://'+S3_BUCKET_LOCATION+'.amazonaws.com/'+S3_BUCKET+'/'+filename
        };
        res.send(retData);
    });
});

router.post('/private/ajax/registerUploadedFile', function(req, res){
    var filename = req.body.filename;
    var fileType = req.body.fileType;
    var className = req.body.className;
    var school = req.body.school;
    database.addFile(filename, fileType, className, school, function(err){
        if(err)
            console.log('Register uploaded file failed for '+filename);
    });
    res.end();
});


module.exports = router;