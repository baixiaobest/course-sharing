var mongoose = require('mongoose');
var databaseSchemas = require('./databaseSchema');

var productionCode = false;
var url = '';
if(productionCode)
    url = 'mongodb://baixiaobest:baixiao123Qq@ds153710.mlab.com:53710/heroku_svf3wf7n';
else
    url = 'mongodb://localhost:27017/nodeauth';

mongoose.connect(url);
var db = mongoose.connection;
db.on('error', function(){console.error('mongodb connection error at '+url);});
db.once('open', function(){console.log('mongodb connected at '+url);});

var usersModel = mongoose.model('users', databaseSchemas.usersSchema);

function Database(){
    
}

Database.prototype.findUserWithEmail = function(email, callback){
    usersModel.findOne({email:email}, function(err, userdata){
        if(err || userdata == null){
            return callback(err, null);
        }
        callback(null, userdata);
    });
};

Database.prototype.findUserWithUsername = function(username, callback){
    usersModel.findOne({username:username}, function(err, userdata){
        if(err || userdata == null){
            return callback(err, null);
        }
        callback(null, userdata);
    });
};

Database.prototype.addUser = function(userdata, callback){
    if(!userdata.username || !userdata.email || !userdata.password){
        callback('userdata not complete');
        return;
    }
    usersModel.create(userdata, function(err, data){
        if(err){
            callback('cannot add user to database');
        }
    });
};

module.exports = new Database();