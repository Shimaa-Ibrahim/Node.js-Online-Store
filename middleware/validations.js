const { body } = require('express-validator');

const User = require('../models/mongodb_models/users');

const passwordValidation = [
    body('password', 'Please enter a password with least 8 characters!')
        .isLength({ min: 3 })
        .trim(),

    body('confirmation')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match!');
            }
            return true;
        })
]

exports.passValidator = passwordValidation;

exports.userRegister = [
    body('email', 'Invalid email!')
        .isEmail()
        .custom((value, { req }) => {
            return User.findOne({ email: req.body.email })
                .then(user => {
                    if (user) {
                        return Promise.reject("This mail elready exists!");
                    }
                });
        })
        .normalizeEmail()
    ,
    body('name', 'Name required and should contain letters and numbers only!')
        .isAlphanumeric()
        .trim(),
    passwordValidation
]

exports.imageValidator = body('imageURL')
    .custom((value, { req }) => {
        if (!req.file) {
            throw new Error('Attached file is not an image.');
        }
        return true;
    })

exports.productValidator = [
    body('title', 'Product title required!')
        .notEmpty()
        .isString()
        .trim(),
    // price
    body('price', 'Invalid Price .. Price required!')
        .isFloat(),
    // dic
    body('description', 'description required!')
        .isLength({ min: 5, max: 400 })
        .trim()
]