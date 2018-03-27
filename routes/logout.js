var express = require('express');
var router = express.Router();
var passport = require('passport');
var samlStrategy = passport._strategy('saml');
var logout = require('express-passport-logout');


/* GET users listing. */
router.post('/', function (req, res, next) {
  console.log('dentro de logout');
  console.log('ANTES DE LOGOUT');
  console.log(req.session);
  req.logOut();
  console.log('DESPUES DE LOGOUT');
  console.log(req.session);

  req.session.destroy(() => {
    res.clearCookie('connect.sid', {
      path: '/admin',
      httpOnly: true,
    })
    console.log('Cookies destruidas');
    console.log(req.session);

    console.log('Borrar la caché');


    res.redirect('../random');
  }); 
});



module.exports = router;
