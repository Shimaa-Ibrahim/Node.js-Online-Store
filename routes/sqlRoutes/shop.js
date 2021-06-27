const express = require("express");

const shopController = require('../../contollers/sqlControllers/shop');
const isAuth = require('../../middleware/auth');

const router = express.Router();

router.get("/prod/:id", shopController.getProductDetails);
router.get("/", shopController.getProducts);
router.get("/add-to-cart/:id/:quant?", isAuth.isNotLoggedIn, shopController.addToCart);
router.get("/cart", isAuth.isNotLoggedIn, shopController.getCartItems);
router.get("/remove-from-cart/:id", isAuth.isNotLoggedIn, shopController.RemoveFromCart);
router.post("/make-order", isAuth.isNotLoggedIn, shopController.makeOrder);
router.get("/orders", isAuth.isNotLoggedIn, shopController.getOrders);
// router.get("/delete-order/:id", isAuth, shopController.deleteOrder)



module.exports = router;
