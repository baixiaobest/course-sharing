var mongoose = require('mongoose');
var databaseSchemas = require('./databaseSchema');

var productionCode = true;
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
var uploadFileModel = mongoose.model('uploadFiles', databaseSchemas.uploadFilesSchema);

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
        return callback('userdata not complete');
    }
    usersModel.create(userdata, function(err, data){
        if(err){
            return callback('cannot add user to database');
        }
    });
};

Database.prototype.updateUser = function(oldname, newProfile, callback){
    usersModel.update({username:oldname}, {$set: newProfile}, function(err){
        if(err){
            return callback(err);
        }
        callback(null);
    });
}

Database.prototype.updatePassword = function(username, password, callback){
    usersModel.update({username: username}, {$set: {password:password}}, function(err){
        if(err){
            return callback(err);
        }
        callback(null);
    });
}

Database.prototype.addFile = function(filename, fileType, className, school, callback){
    
    var data = {
        filename: filename, 
        filenameLower: filename.toLowerCase(),
        fileType: fileType, 
        className: className,
        school: school
    };
    uploadFileModel.create(data, function(err, data){
        if(err)
            return callback(err);
        callback();
    });
}

Database.prototype.findFiles = function(keywords, className, school, callback){

    var formatData = function(err, docs){
        var data = [];
        docs.forEach(function(ele){
            data.push({filename: ele.filename, className: ele.className});
        });
        callback(null, data);
    }

    if(keywords == null){
        uploadFileModel.find({
            className: {$regex: className},
            school: school
        }, formatData);
    }else{
        var ORQuery = [];
        keywords.forEach(function(ele){
            ORQuery.push({filenameLower: {$regex: ele}});
        });
        uploadFileModel.find({
            $or: ORQuery,
            className: {$regex: className},
            school: school
        }, formatData);
    }
}

module.exports = new Database();