var fs = require('fs');
var express = require('express');
var router = express.Router();

var streamFile = function(res, filePath){
    res.on('finish', function(){
        res.end();
    });
    fs.createReadStream(filePath).pipe(res);
}

// publicaly accessible html file
router.get('/:publicFile', function(req, res){
    streamFile(res, './Web/public/'+req.params.publicFile);
});

// bootstrap files
router.get('/bootstrap/:subfolder/:file', function(req, res){
    streamFile(res, './Web/bootstrap/'+req.params.subfolder+'/'+req.params.file);
});

// css files
router.get('css/:file', function(req, res){
    streamFile(res, './Web/'+req.params.file);
});

module.exports = router;