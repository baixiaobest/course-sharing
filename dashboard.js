var express = require('express');
var router = express.Router();
var fs = require('fs');
var sessionConfig = require('./sessionConfig');
var session = require('express-session');

var authenticateSession = function(req, res, next){
    if(!req.session.username){
        res.redirect('/404');
    }else{
        next();
    }
};

router.use(session(sessionConfig));
router.use(authenticateSession);

router.get('/private/dashboard', function(req, res){
    var filestream = fs.createReadStream('./Web/private/dashboard.html');
    filestream.pipe(res);
    filestream.on('error', function(){
        console.log('cannot find dashboard.html');
    });
});

module.exports = router;