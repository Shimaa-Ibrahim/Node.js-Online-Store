const Product = require('../../models/sql_models/products');

exports.getProducts = (req, res) => {
  // res.status(200).sendFile(path.join(rootDirPath,'views', 'products.html')); //serve static html
  Product.findAll()
    .then(products => {
      res.render("shop/shop", {
        path: "/",
        title: "OnlineShop",
        productCss: true,
        products: products
        // shopPath: true
      });
    })
    .catch(err => {
      Console.log(err);
    });
};

exports.getProductDetails = (req, res) => {
  Product.findByPk(req.params.id).then(product => {
    if (product) {
      res.render("shop/product_details", {
        path: "",
        title: `OnlineShop - ${product.title} `,
        productCss: false,
        product: product
      });
    } else {
      res.redirect("/errors/404");
    }
  });
};

exports.getCartItems = (req, res) => {
  req.user
    .getCart()
    .then(cart => {
      return cart.getProducts();
    })
    .then(products => {
      res.render("shop/cart", {
        path: "/shop/cart",
        title: `OnlineShop - My Cart `,
        products: products
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.addToCart = (req, res) => {
  let fetchedCart;
  let quantity = req.params.quant ? parseInt(req.params.quant) : 1;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: req.params.id } });
    })
    .then(products => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }
      if (product) {
        console.log(product);
        quantity = req.params.quant? req.params.quant : product.CartItems.quantity + 1;
        return product;
      }
      return Product.findByPk(req.params.id);
    })
    .then(product => {
      return fetchedCart.addProduct(product, {
        through: { quantity: quantity }
      });
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch(err => {
      console.log(err);
    });
};

exports.RemoveFromCart = (req, res) => {
  req.user
    .getCart()
    .then(cart => {
      return cart.getProducts({ where: { id: req.params.id } });
    })
    .then(products => {
      const product = products[0];
      return product.CartItems.destroy();
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch(err => {
      console.log(err);
    });
};

exports.makeOrder = (req, res) => {
  let fetchedCart;
  req.user
    .getCart()
    .then(cart => {
      if(!cart){
        res.redirect('/cart');
      }
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(products => {
      return req.user
        .createOrder()
        .then(order => {
          return order.addProducts(
            products.map(product => {
              product.OrderItems = { quantity: product.CartItems.quantity };
              return product;
            })
          );
        })
        .catch(err => {
          console.log(err);
        });
    })
    .then(() => {
      return fetchedCart.setProducts(null);
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch(err => {
      console.log(err);
    });
};

// get user's orders and orders details
exports.getOrders = (req, res) => {
  req.user.getOrders().then(orders => {
    let ordersDetails = async() => {
      return Promise.all(orders.map(async (order) => {
      return await order.getProducts()
      })
      )
    }
    ordersDetails().then((data) => {
      res.render('shop/orders', {
      path: "/shop/orders",
      title: 'OnlineShop - My Orders',
      orders: orders,
      details: data
    })

    })
  }).catch(err => {
    console.log(err);
  });
}

// exports.deleteOrder = (req, res) => {
//   req.user
//     .getOrders({ where: { id: req.params.id } })
//     .then(order => {
//       return order[0].destroy();
//     }).then(() => {
//       res.redirect("/orders");
//     })
//     .catch(err => {
//       console.log(err);
//     });

// };