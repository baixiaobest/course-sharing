var sessionConfig = {
    secret: 'session secret used to encrypt everything',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 10*60*1000}
}

module.exports = sessionConfig;