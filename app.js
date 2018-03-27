var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var fs = require('fs');



//agregado********************
var SamlStrategy = require('passport-saml').Strategy;
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});
debugger;
passport.use(new SamlStrategy(
  {
    path: '/login/callback',
    entryPoint: 'https://login.windows.net/a9bcc161-8a00-4fad-b3e7-86c22b7d9556/saml2',
    issuer: '7f824885-cb54-4165-b138-2517f225c888',
    cert: fs.readFileSync('MyTestApp.cer', 'utf-8'),
    signatureAlgorithm: /*'sha256'*/ 'Base64'
  },
  function (profile, done) {
    return done(null,
      {
        id: profile['nameID'],
        email: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        displayName: profile['http://schemas.microsoft.com/identity/claims/displayname'],
        firstName: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'],
        lastName: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname']
      });
  })
);
//****************************


var indexRouter = require('./routes/index');
var logoutRouter = require('./routes/logout');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'/*'hjs'*/);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//Agregado****************************
app.use(session(
  {
    resave: true,
    saveUninitialized: true,
    secret: 'this thing hits'
  }));
app.use(passport.initialize());
app.use(passport.session());

/************************************ */

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/logout', logoutRouter);

//Agregado************************************

app.get('/login',
  passport.authenticate('saml', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);

debugger;
app.post('/login/callback',
  passport.authenticate('saml', {
    failureRedirect: '/',
    failureFlash: true
  }),
  function (req, res) {
    res.redirect('/');
  }
);

debugger;


app.get('/logout', function (req, res) {
  console.log('dentro de logout');

  //borro las cookies
  cookie = req.cookies;
  for (var prop in cookie) {
    if (!cookie.hasOwnProperty(prop)) {
      continue;
    }
    res.cookie(prop, '', { expires: new Date(0) });
  }
    req.logout();
    res.render('logout');
});
//****************************************** */

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
