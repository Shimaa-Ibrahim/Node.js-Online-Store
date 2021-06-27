const Product = require('../../models/sql_models/products');

exports.getProducts = (req, res) => {
  req.user
    .getProducts()
    .then(products => {
      res.render("admin/products", {
        path: "/admin/products",
        title: "OnlineShop - Products",
        productCss: true,
        // shopPath: true
        products: products
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getAddProduct = (req, res) => {
  if (req.params.id) {
    req.user
      .getProducts({ where: { id: req.params.id } })
      .then(products => {
        let product = products[0];
        if (!product) {
          return res.redirect("/errors/404");
        }
        return res.render("admin/add-prod", {
          path: "/admin/add-prod",
          title: "OnlineShop - Edit Product",
          product: product,
          btn: "Edit"
        });
      })
      .catch(err => {
        console.log(err);
      });
  } else {
    res.render("admin/add-prod", {
      path: "/admin/add-prod",
      title: "OnlineShop - Add Products",
      btn: "Add"
      // addProdPath: true
    });
  }

  // res.status(200).sendFile(path.join(rootDirPath,'views', 'add-prod.html')); //serve static html
};

exports.addProduct = (req, res) => {
  req.user
    .createProduct({
      title: req.body.title,
      price: req.body.price,
      imageURL: req.body.imageURL,
      description: req.body.description
    })
    .then(result => {
      res.redirect("/admin/products");
    })
    .catch(err => {
      console.log(err);
    });
};

exports.editProduct = (req, res) => {
  const updatedProduct = req.body;
  Product.findByPk(updatedProduct.id)
    .then(product => {
      product.title = updatedProduct.title;
      product.price = updatedProduct.price;
      product.imageURL = updatedProduct.imageURL;
      product.description = updatedProduct.description;
      return product.save();
    })
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch(err => {
      console.log(err);
    });
};


exports.deleteProduct = (req, res)=> {
    Product.findByPk(req.params.id).then(product=>{
        return product.destroy()
    }).then(()=>{
        res.redirect('/admin/products');
    }).catch(err=>{
        console.log(err)
    })
}