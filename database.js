var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://baixiaobest:baixiao123Qq@ds153710.mlab.com:53710/heroku_svf3wf7n';

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
    connect('', function(err, db){
        if(err){
            callback(err);
            return;
        }
        var cursor = db.collection('users').find({'email':email}).limit(1);
        cursor.toArray( function(err, items){
            if(err || items.length == 0){
                db.close();
                callback(err, null);
                return;
            }
            db.close();
            callback(null, items[0]);
        });
    });
};

Database.prototype.findUserWithUsername = function(username, callback){
    connect('', function(err, db){
        if(err){
            callback(err);
            return;
        }
        var cursor = db.collection('users').find({'username':username}).limit(1);
        cursor.toArray( function(err, items){
            if(err || items.length == 0){
                db.close();
                callback(err, null);
                return;
            }
            db.close();
            callback(null, items[0]);
        });
    });
};

Database.prototype.addUser = function(userdata, callback){
    if(!userdata.username || !userdata.email || !userdata.password){
        callback('userdata not complete');
        return;
    }
    connect('nodeauth', function(err, db){
        if(err){
            callback(err);
            return;
        }
        db.collection('users').insertOne(userdata);
        db.close();
        callback();
    });
};

module.exports = new Database();