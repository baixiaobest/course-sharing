var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    school: String
});

var uploadFilesSchema = new Schema({
    filename: String,
    filenamePath: String,
    className: String,
    school: String
});

module.exports.usersSchema = usersSchema;
module.exports.uploadFilesSchema = uploadFilesSchema;