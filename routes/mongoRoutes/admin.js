const express = require("express");

const adminController = require('../../contollers/mongoControllers/admin');
const isAuth = require('../../middleware/auth');
const validator = require('../../middleware/validations');

const router = express.Router();

router.get("/products", isAuth.isNotLoggedIn, isAuth.isAdmin, adminController.getProducts);

router.get("/add-prod", isAuth.isNotLoggedIn, isAuth.isAdmin, adminController.getAddProduct);
router.post("/add-prod", isAuth.isNotLoggedIn, isAuth.isAdmin, validator.productValidator,validator.imageValidator,  adminController.addProduct);

router.get("/edit-prod/:id",isAuth.isNotLoggedIn, isAuth.isAdmin, adminController.getAddProduct);
router.post("/edit-prod/:id",isAuth.isNotLoggedIn, isAuth.isAdmin, validator.productValidator, adminController.editProduct);

router.get("/delete-prod/:id", isAuth.isNotLoggedIn, isAuth.isAdmin, adminController.deleteProduct);


module.exports = router;