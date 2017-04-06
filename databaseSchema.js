var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new Schema({
    name: String,
    username: String,
    email: String,
    password: String
});

module.exports.usersSchema = usersSchema;