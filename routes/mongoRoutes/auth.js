const express = require("express");

const authController = require('../../contollers/mongoControllers/auth');
const isAuth = require('../../middleware/auth');
const validator = require('../../middleware/validations');
const router = express.Router();


router.get("/register", isAuth.isLoggedIn, authController.register);
router.post("/register",isAuth.isLoggedIn, validator.userRegister ,authController.postregister);

router.get("/login",isAuth.isLoggedIn, authController.login);
router.post("/login",isAuth.isLoggedIn, authController.postlogin);

router.get("/logout", isAuth.isNotLoggedIn, authController.logout);

router.get("/reset-password",isAuth.isLoggedIn, authController.resetPassword);
router.post("/post-reset-password",isAuth.isLoggedIn, authController.postResetPassword);

router.get("/new-password/:token",isAuth.isLoggedIn, authController.newPassword);
router.post("/post-new-password",isAuth.isLoggedIn, validator.passValidator ,authController.postNewPassword);

module.exports = router;