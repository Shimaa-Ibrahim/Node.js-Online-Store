const express = require("express");

const adminController = require('../../contollers/sqlControllers/admin');
const isAuth = require('../../middleware/auth');

const router = express.Router();

router.get("/add-prod", isAuth.isNotLoggedIn, isAuth.isAdmin, adminController.getAddProduct);
router.post("/add-prod", isAuth.isNotLoggedIn, isAuth.isAdmin, adminController.addProduct);
router.get("/products", isAuth.isNotLoggedIn, isAuth.isAdmin, adminController.getProducts);
router.get("/edit-prod/:id", isAuth.isNotLoggedIn, isAuth.isAdmin, adminController.getAddProduct);
router.post("/edit-prod/:id", isAuth.isNotLoggedIn, isAuth.isAdmin, adminController.editProduct);
router.get("/delete-prod/:id", isAuth.isNotLoggedIn, isAuth.isAdmin, adminController.deleteProduct);


module.exports = router;
