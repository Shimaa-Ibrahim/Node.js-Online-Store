const express = require("express");

const isAuth = require('../../middleware/auth');
const authController = require('../../contollers/sqlControllers/auth');

const router = express.Router();


router.get("/register", isAuth.isLoggedIn, authController.register);
router.get("/login", isAuth.isLoggedIn, authController.login);
router.post("/register", isAuth.isLoggedIn, authController.postregister);
router.post("/login", isAuth.isLoggedIn, authController.postlogin);
router.get("/logout", isAuth.isNotLoggedIn, authController.logout);

module.exports = router;
