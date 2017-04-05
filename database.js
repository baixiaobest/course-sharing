var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/';

function Database(){
    
}

var connect = function(databaseName, callback){
    MongoClient.connect(url+databaseName, function(err, db){
        if(err){
            console.log('fail to connect to mongodb '+databaseName);
            callback(err);
            return;
        }
        callback(null, db);
    })
};

Database.prototype.findUserWithEmail = function(email, callback){
    connect('nodeauth', function(err, db){
        if(err){
            callback(err);
            return;
        }
        var cursor = db.collection('users').find({'email':email}).limit(1);
        cursor.toArray( function(err, items){
            if(err || items.length == 0){
                db.close();
                callback(err);
                return;
            }
            db.close();
            callback(null, items[0]);
        });
    });
};

Database.prototype.findUserWithUsername = function(username, callback){
    connect('nodeauth', function(err, db){
        if(err){
            callback(err);
            return;
        }
        var cursor = db.collection('users').find({'username':username}).limit(1);
        cursor.toArray( function(err, items){
            if(err || items.length == 0){
                db.close();
                callback(err);
                return;
            }
            db.close();
            callback(null, items[0]);
        });
    });
};

module.exports = new Database();