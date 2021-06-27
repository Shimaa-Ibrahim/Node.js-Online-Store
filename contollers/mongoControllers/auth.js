const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
// const nodemailer = require('nodemailer')
const sandgrid = require('@sendgrid/mail')

const User = require("../../models/mongodb_models/users");

const SANDGRID_API_KEY = "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";
sandgrid.setApiKey(SANDGRID_API_KEY);
// const transporter = nodemailer.createTransport(sandgrid({
//   auth: {
//     api_key : SANDGRID_API_KEY
//   }
// }))

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
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req)
  const errs = validationResult(req).array().map(err => err.msg);

  if (errors.isEmpty()) {
    return bcrypt.hash(password, 12).then(hash => {
      const user = new User({
        name,
        email,
        password: hash,
        cart: { items: [] }
      });
      return user.save();
    }).then(result => {
      // send mail to user
      sandgrid.send({
        to: email,
        from: 'devemails@aol.com',
        subject: "Welcome to OnlineShop - register successfully",
        html: "<h1>Congrants, register successfully!</h1>"
      }).then(() => {
        console.log("email sent")
      }).catch(err => {
        console.log(err)
      });
      req.flash('success', 'Congrats! you are registered successfully!');
      res.redirect('/auth/login');
    }).catch(err => {
      console.log(err);
      next(new Error(err));
    });
  }
  else {
    req.flash('error', errs);
    return res.redirect("/auth/register")
  }
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
  User.findOne({ email: req.body.email })
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
            req.session.isAdmin = user.isAdmin
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
    .catch(err =>{
     console.log(err);
     next(new Error(err));
    });

}

// reset password
exports.resetPassword = (req, res) => {
  let errorMessage = req.flash('error');
  let successMessage = req.flash('success');
  res.render('auth/reset-password', {
    title: "OnlineShop - Reset Password",
    path: 'N/A',
    errorMessages: errorMessage,
    successMessage: successMessage
  });
}

exports.postResetPassword = (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      req.flash('error', 'Something wrong happened.. Please try again!')
      return res.redirect('/auth/reset-password');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'Email not found!');
          return res.redirect('/auth/reset-password');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        req.flash('success', 'A password reset link was sent. Click the link in the email to create a new password.');
        res.redirect('/auth/reset-password');
        sandgrid.send({
          to: req.body.email,
          from: 'devemails@aol.com',
          subject:  'OnlineShop - Reset password',
          html:`
          <h4>Forgot your password!</h4>
          <p>To reset your password, click the following link and follow the instructions.</p>
          <p>
          Set new password : <a href = "${req.protocol}://${req.get('host')}/auth/new-password/${token}"> Link</a>
          </p>
          <p> <small>Note: Token only valid for one hour!</samll> </p>
        `
        });
      })
      .catch(err => {
        console.log(err);
        next(new Error(err));
      });
  });
}



exports.newPassword = (req, res) => {
  let errorMessages = req.flash('error');
  let valid = true
  let id = null;
  User.findOne({ resetToken: req.params.token, resetTokenExpiration: { $gt: Date.now() } }).then(user => {
    if (!user) {
      valid = false;
      req.flash('error', 'Invalid Token!')

    } else {
      id = user._id;
    }
    let message = req.flash('error');
    res.render('auth/new-password', {
      title: 'Change Password',
      path: 'N/A',
      errorMessages: errorMessages,
      userId: id,
      token: req.params.token,
      valid: valid
    })

  }).catch(err => {
    console.log(err);
    next(new Error(err));

  });

}

exports.postNewPassword = (req, res) => {
  const errors = validationResult(req)
  const errs = validationResult(req).array().map(err => err.msg);
  User.findOne({
    _id: req.body.userId,
    resetToken: req.body.token,
    resetTokenExpiration: { $gt: Date.now() }
  }).then(user => {
    if (!user) {
      req.flash('error', 'something went wrong.. try again later!');
      return res.redirect('/auth/login');
    }
    if (errors.isEmpty()) {
      return bcrypt.hash(req.body.password, 12).then(hash => {
        user.password = hash;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        return user.save()
      }).then(() => {
        req.flash('success', 'Password updated successfully!');
        res.redirect('/auth/login');
      }).catch(err => {
        console.log(err);
        next(new Error(err));

      })
    }
    else {
      req.flash('error', errs);
      res.redirect(`/auth/new-password/${req.body.token}`);
    }
  }).catch(err => {
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