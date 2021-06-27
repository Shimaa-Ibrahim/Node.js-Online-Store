const bcrypt = require('bcryptjs');
// const nodemailer = require('nodemailer')
const sandgrid = require('@sendgrid/mail')
const dotenv = require('dotenv');
dotenv.config();

const User = require("../../models/sql_models/users");

const SANDGRID_API_KEY = process.env.SANDGRID_API_KEY;
sandgrid.setApiKey(SANDGRID_API_KEY);



exports.register = (req, res) => {
  let messages = req.flash('error');
  res.render('auth/register', {
    path: "/auth/register",
    title: "OnlineShop - Rgister",
    errorMessages: messages
  });
}

exports.postregister = (req, res) => {
  // check if user already exists
  let valid = true;
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmation = req.body.confirmation;
  const errs = []

  // validations
    User.findOne({ where: { email: req.body.email }})
      .then(user => {
        if (user) {
          req.flash('error', ['Email exists already!']);
          return res.redirect('/auth/register');
        }
        // email do not exist! 
        if (!name) {
          valid = false
          errs.push('Name required!');
        }

        if (!email) {
          valid = false
          errs.push('Email required!');
        }
        if (!password) {
          valid = false
          errs.push('Password required!');
        }

        if (password && password.length < 3) {
          valid = false
          errs.push('Password password must contain at least 8 characters!');
        }

        if (password !== confirmation) {
          valid = false
          errs.push('passwords do not match!');
        }

        if (valid) {
          return bcrypt.hash(password, 12).then(hash => {
            return User.create({
              name,
              email,
              password: hash
            })
          }).then(() => {
            // send mail to user
            sandgrid.send({
              to : email,
              from : 'devemails@aol.com',
              subject : "Welcome to OnlineShop - register successfully",
              html: "<h1>Congrants, register successfully!</h1>" 
            });

            req.flash('success', 'Congrats! you are registered successfully!');
            res.redirect('/auth/login');
          }).catch(err => {
            console.log(err);
          });
        }
        else {
          req.flash('error', errs);
          return res.redirect("/auth/register")
        }
      }).catch(err => {
        console.log(err);
        next(new Error(err));
      });
  }


  exports.login = (req, res) => {
    let messages = req.flash('error');
    let message = req.flash('success');

    res.render('auth/login', {
      path: "/auth/login",
      title: "OnlineShop - Login",
      errorMessages: messages,
      message: message
    });
  }

  exports.postlogin = (req, res) => {
    User.findOne({where : { email: req.body.email } })
      .then(user => {
        if (!user) {
          req.flash('error', 'Invalid email or password!');
          return res.redirect('/auth/login');
        }
        bcrypt
          .compare(req.body.password, user.password)
          .then(match => {
            if (match) {
              req.session.isLoggedIn = true;
              req.session.user = user;
              return req.session.save(err => {
                console.log(err);
                res.redirect('/');
              });
            }
            req.flash('error', 'Invalid email or password!');
            res.redirect('/auth/login');
          })
          .catch(err => {
            console.log(err);
            res.redirect('/auth/login');
          });
      })
      .catch(err => {
        console.log(err);
        next(new Error(err));
      });

  }

  exports.logout = (req, res) => {
    req.session.destroy(err => {
      console.log(err);
      res.redirect('/');
    });

  }