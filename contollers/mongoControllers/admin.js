const { validationResult } = require('express-validator');

const Product = require('../../models/mongodb_models/products');
const fileHelper = require('../../util/files');

exports.getProducts = (req, res) => {
  const ITEMS_PER_PAGE = 3;
  let page = +req.query.page || 1;
  let productCount = 0;
  Product.find({ userId: req.user })
    .countDocuments()
    .then(count => {
      productCount = count;
      return Product.find({ userId: req.user })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    }).then(products => {
      res.render("admin/products", {
        path: "/admin/products",
        title: "OnlineShop - Products",
        productCss: true,
        // shopPath: true,
        products: products,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < productCount,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(productCount / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      console.log(err);
      next(new Error(err));
    });
};

exports.getAddProduct = (req, res) => {
  let messages = req.flash('error');
  if (req.params.id) {
    Product.findById(req.params.id)
      .then(product => {
        if (!product) {
          return res.redirect("/errors/404");
        }
        product.id = product._id
        return res.render("admin/add-prod", {
          path: "/admin/add-prod",
          title: "OnlineShop - Edit Product",
          product: product,
          errorMessages: messages,
          btn: "Edit"
        });
      })
      .catch(err => {
        console.log(err);
        next(new Error(err));
      });
  } else {
    res.render("admin/add-prod", {
      path: "/admin/add-prod",
      title: "OnlineShop - Add Products",
      errorMessages: messages,
      btn: "Add"
      // addProdPath: true
    });
  }

  // res.status(200).sendFile(path.join(rootDirPath,'views', 'add-prod.html')); //serve static html
};

exports.addProduct = (req, res) => {
  const title = req.body.title;
  const imageURL = req.file ? req.file.path.slice(6) : null;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req)
  const errs = validationResult(req).array().map(err => err.msg);
  if (errors.isEmpty()) {
    const product = new Product({
      title,
      price,
      description,
      imageURL,
      userId: req.user
    });
    product.save().then(() => {
      res.redirect("/admin/products");
    })
      .catch(err => {
        console.log(err);
        next(new Error(err));
      });
  }
  else {
    req.flash('error', errs);
    return res.redirect("/admin/add-prod")
  }
};


exports.editProduct = (req, res) => {
  const errors = validationResult(req)
  const errs = validationResult(req).array().map(err => err.msg);

  // if input errors
  if (!errors.isEmpty()) {
    req.flash('error', errs);
    return res.redirect(`/admin/edit-prod/${req.params.id}`);
  }

  Product.findById(req.params.id).then(product => {
    // if user not authorized
    if (product.userId == req.user._id) {
      req.flash('error', '401 - Unauthorized! cannot update product!');
      return res.redirect("/admin/products");
    }
    product.title = req.body.title;
    product.price = req.body.price;
    product.description = req.body.description;
    if (req.file) {
      fileHelper.deleteFile('public' + product.imageURL);
      product.imageURL = req.file.path.slice(6);
    }
    return product.save();
  }).then(() => {
    res.redirect("/admin/products");
  })
    .catch(err => {
      console.log(err);
      next(new Error(err));
    });
};


exports.deleteProduct = (req, res) => {
  Product.deleteOne({
    _id: req.params.id,
    userId: req.user._id
  }).then(() => {
    return res.redirect('/admin/products');
  }).catch(err => {
    console.log(err);
    next(new Error(err));
  })
}