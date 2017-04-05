var express = require('express');
var indexRouter = require('./index');
var loginRouter = require('./login');
var registerRouter = require('./register');
var dashboardRouter = require('./dashboard')
var app = express();

var PORT = process.env.PORT || 8080;

app.use('/', loginRouter);
app.use('/', registerRouter);
app.use('/', indexRouter);
app.use('/', dashboardRouter);

app.listen(PORT);

console.log("listening at localhost:"+PORT);