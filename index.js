var fs = require('fs');
var express = require('express');
var router = express.Router();

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
    })
}

// publicaly accessible html file
router.get('/:publicFile', function(req, res){
    streamFile(res, './Web/public/'+req.params.publicFile, send404);
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

module.exports = router;