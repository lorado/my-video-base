const nodemailer = require('../../helpers/nodemailer');
const Account = require('../../models/Account');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const express = require('express');
const router = express.Router();

// Error handling
const sendError = (err, res) => {
  const message = typeof err == 'object' ? err.message : err;
  res.status(500).json({
    errorMessage: message
  });
};

const generateAccountToken = (accountId) => {
  return jwt.sign({account: accountId}, process.env.JWT_SECRET, {expiresIn: '30d'})
};

router.post('/registration', (req, res) => {
  if (!req.body.email || !req.body.password) {
    return sendError('Manche Felder sind leer', res);
  }

  const account = new Account({
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  });

  account.save((err, result) => {
    if (err) {
      if (err.errors.email.kind !== undefined && err.errors.email.kind === 'unique') {
        err.message = "Die eingegebene E-Mail Adresse ist bereits in Benutzung";
      }
      return sendError(err, res);
    }

    // return token, and do autologin
    res.json({
      token: generateAccountToken(account.id)
    });

    // send success mail
    nodemailer.send({
      from: '"My Video Base" <no-reply@eugensacharow.de>',
      to: req.body.email,
      subject: 'Willkommen bei My Video Base',
      html: 'Du hast einen Account auf My Video Base erstellt. <br><br>Nun kannst du deine eigene Film-Kollektion erstellen.'
    })
  });
});

router.post('/login', (req, res) => {
  if (!req.body.email || !req.body.password) {
    return sendError('Manche Felder sind leer', res);
  }

  Account.findOne({
    email: req.body.email
  }, (err, account) => {
    if (err) {
      return sendError(err, res);
    }
    if (!account) {
      return sendError('Ungültige Login-Daten', res);
    }
    if (!bcrypt.compareSync(req.body.password, account.password)) {
      return sendError('Ungültige Login-Daten', res);
    }
    res.json({
      token: generateAccountToken(account.id)
    });
  });
});

module.exports = router;
