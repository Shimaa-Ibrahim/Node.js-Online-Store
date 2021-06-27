const express = require("express");

const shopController = require('../../contollers/mongoControllers/shop');
const isAuth = require('../../middleware/auth');

const router = express.Router();

router.get("/", shopController.getProducts);
router.get("/prod/:id", shopController.getProductDetails);

router.get("/cart", isAuth.isNotLoggedIn, shopController.getCartItems);
router.get("/add-to-cart/:id/:quant?", isAuth.isNotLoggedIn, shopController.addToCart);
router.get("/remove-from-cart/:id", isAuth.isNotLoggedIn, shopController.RemoveFromCart);

router.get("/checkout", isAuth.isNotLoggedIn, shopController.checkout);

router.get("/make-order", isAuth.isNotLoggedIn, shopController.makeOrder);
router.get("/orders", isAuth.isNotLoggedIn, shopController.getOrders);
router.get("/orders/:id", isAuth.isNotLoggedIn, shopController.getInvoice);

// router.get("/delete-order/:id", isAuth, shopController.deleteOrder)



module.exports = router;