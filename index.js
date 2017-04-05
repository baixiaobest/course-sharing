var fs = require('fs');
var express = require('express');
var router = express.Router();
var session = require('express-session');
var sessionConfig = require('./sessionConfig');

router.use(session(sessionConfig));

var streamFile = function(res, filePath, callback){
    res.on('finish', function(){
        res.end();
    });
    var readstream = fs.createReadStream(filePath);
    readstream.pipe(res);
    readstream.on('error', function(){
        callback(res);
    })
}

var send404 = function(res){
    res.on('finish', function(){
        res.end();
    });
    var readstream = fs.createReadStream('./Web/public/404.html');
    readstream.pipe(res);
    readstream.on('error', function(){
        console.log('fail to send 404');
    });
}

var authenticateSession = function(req, res, next){
    if(req.session.username){
        res.redirect('/private/dashboard');
        return;
    }
    next();
};

// publicaly accessible html file
router.get('/:publicFile', function(req, res){
    streamFile(res, './Web/public/'+req.params.publicFile, send404);
});

//mainpage
router.get('/', authenticateSession, function(req, res){
    streamFile(res, './Web/public/index.html');
});

// bootstrap files
router.get('/bootstrap/:subfolder/:file', function(req, res){
    streamFile(res, './Web/bootstrap/'+req.params.subfolder+'/'+req.params.file, send404);
});

// css files
router.get('/css/:file', function(req, res){
    streamFile(res, './Web/css/'+req.params.file, send404);
});

// JS files
router.get('/JS/:file', function(req, res){
    streamFile(res, './Web/JS/'+req.params.file, send404);
});

// 404
router.get('404', function(req, res){
    send404(res);
});

module.exports = router;