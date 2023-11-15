var express = require('express');
const passport = require('passport');
var router = express.Router();
const bcrypt = require('bcrypt')
const registerUser = require('../database/oracle').registerUser
const MitarbeiterdatenGET = require('../database/oracle').getMitarbeiterdaten
const anderPasswort = require('../database/oracle').anderPasswort







/* GET users listing. */
router.get('/', async function(req, res, next) {
    if(req.isAuthenticated()){
      const userID = req.user.id
      var Mitarbeiterdaten = await MitarbeiterdatenGET(userID)
      const MitarbeiterdatenUebergabe = Mitarbeiterdaten
      res.render('myAccount',{title: 'MyAccount', MitarbeiterDaten: MitarbeiterdatenUebergabe, login: true})
    }
    res.render('account', { title: 'Express',login: false});
});


/*
router.post('/login',passport.authenticate('local',{
    failureRedirect: '/',
    failureFlash: true,
}   ),(req,res)=>{
  console.log('hier it was')
  req.flash('success', 'Erfolgreich eingeloggt')
  res.redirect('/cart')
})*/


/*
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/',
  failureFlash: true,
}), (req, res) => {
  // Hier greifen wir auf die Flash-Nachrichten zu
  console.log('Du bist im login')
  const errorMessages = req.flash('error');
  
  if (errorMessages.length > 0) {
      // Es gibt Fehlermeldungen, die angezeigt werden sollen
      res.render('account', { title: 'Express', login: false, errors: errorMessages });
  } else {
      // Es gibt keine Fehlermeldungen, der Benutzer wurde erfolgreich eingeloggt
      req.flash('success', 'Erfolgreich eingeloggt');
      res.redirect('/cart');
  }
});*/

const authenticate = (req, res, next) => {
  passport.authenticate('local', {
      failureRedirect: '/',
      failureFlash: true,
  })(req, res, (err) => {
      if (err) {
          // Fehler während der Authentifizierung
          console.error('Fehler be der Authentifizierung:', err);
        
          return res.redirect('/'); // Oder leite zu einer anderen Seite weiter
      }
      //return 'HALLO'
      // Authentifizierung erfolgreich, rufe die nächste Middleware auf
      return next();
  });

  return 'NEIN'
};

router.post('/login', authenticate, (req, res) => {
  // Hier greifen wir auf die Flash-Nachrichten zu
  console.log('Du bist m login ' + authenticate);
  const errorMessages = req.flash('error');

  if (errorMessages.length > 0) {
      // Es gibt Fehlermeldungen, die angezeigt werden sollen
      res.render('account', { title: 'Express', login: false, errors: errorMessages });
  } else {
      // Es gibt keine Fehlermeldungen, der Benutzer wurde erfolgreich eingeloggt
      req.flash('success', 'Erfolgreich eingeloggt');
      res.redirect('/cart');
  }
});




/**
 * router.post('/login', passport.authenticate('local', {
  failureRedirect: '/',
  failureFlash: true,
}), (req, res) => {
  console.log('HIWE ' + req.authInfo)
  if (req.authInfo) {
      // Falsches Passwort wurde eingegeben
      res.render('account', { title: 'Express', login: false, showPasswordError: true });
  } else {
      req.flash('success', 'Erfolgreich eingeloggt');
      res.redirect('/cart');
  }
});
 */

router.delete('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success','Erfolgreich Ausgelogt')
      res.redirect('/');
    });
  });

router.post('/register', async (req,res) => {
    try {
     const hashedPassword = await bcrypt.hash(req.body.password, 10)

     await registerUser(req.body.email, req.body.telefonnummer, hashedPassword,req.body.vorname, req.body.nachname,req.body.date,req.body.ort, req.body.plz, req.body.strasse, req.body.hausnummer)
    
     res.redirect('/account')

    } catch (error) {
    console.log(error)
     res.sendStatus(500)   
    }
})


router.put('/add', async (req,res) => {
  if(req.isAuthenticated()){
      const userID = req.user.id
      const passwordNewInput = req.body.passwordNewInput
      const passwordWiederholtInput = req.body.passwordWiederholtInput


      if(passwordNewInput === passwordWiederholtInput){

        const hashedPassword = await bcrypt.hash(passwordNewInput, 10)

        await anderPasswort(userID,hashedPassword)
        res.send(200)
      }
  }
  console.log(req.user);
})

module.exports = router;