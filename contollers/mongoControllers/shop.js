const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const SECRET_KEY = process.env.SECRET_KEY;
const PUBLISHABLE_KEY = process.env.PUBLISHABLE_KEY;
const stripe = require('stripe')(SECRET_KEY);


const Product = require('../../models/mongodb_models/products');
const Order = require('../../models/mongodb_models/orders')

exports.getProducts = (req, res, next) => {
    // res.status(200).sendFile(path.join(rootDirPath,'views', 'products.html')); //serve static html
    // pagination
    const ITEMS_PER_PAGE = 3;
    let page = +req.query.page || 1;
    let productCount = 0;
    Product.find()
        .countDocuments()
        .then(count => {
            productCount = count;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        }).then(products => {
            res.render("shop/shop", {
                path: "/",
                title: "OnlineShop",
                productCss: true,
                products: products,
                // shopPath: true,
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < productCount,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(productCount / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            next(new Error(err));
        });
};

exports.getProductDetails = (req, res, next) => {
    Product.findById(req.params.id).then(product => {
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
    }).catch(err => {
        next(new Error(err));
    }
    );
};

exports.getCartItems = (req, res, next) => {
    req.user.populate('cart.items.productId')
        .execPopulate().then(user => {
            // clear deleted products
            let products = user.cart.items.filter(item => {
                if (item.productId == null) req.user.removeFromCart(item._id)
                return item.productId !== null
            });
            res.render("shop/cart", {
                path: "/shop/cart",
                title: `OnlineShop - My Cart `,
                products: products
            });
        })
        .catch(err => {
            next(new Error(err));
        });
};

exports.addToCart = (req, res, next) => {
    let quantity = req.params.quant ? parseInt(req.params.quant) : null;
    Product.findById(req.params.id)
        .then(product => {
            return req.user.addToCart(product, quantity);
        })
        .then(() => {
            res.redirect("/cart");
        })
        .catch(err => {
            next(new Error(err));
        });
};

exports.RemoveFromCart = (req, res, next) => {
    req.user.removeFromCart(req.params.id)
        .then(() => {
            res.redirect("/cart");
        })
        .catch(err => {
            next(new Error(err));

        });
};


exports.checkout = (req, res, next) => {
    let total = 0;
    let products;
    req.user.populate('cart.items.productId')
        .execPopulate().then(user => {
            // clear deleted products
            products = user.cart.items.filter(item => {
                if (item.productId == null) {
                    req.user.removeFromCart(item._id)
                } else {
                    total += item.productId.price * item.quantity
                }
                return item.productId !== null
            });
            return stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: products.map(product => {
                    return {
                        name: product.productId.title,
                        description: product.productId.description,
                        amount: product.productId.price * 100,
                        currency: 'usd',
                        quantity: product.quantity
                    };
                }),
                success_url: req.protocol + '://' + req.get('host') + '/make-order',
                cancel_url: req.protocol + '://' + req.get('host') + '/checkout'
            });

        }).then(session => {
            res.render("shop/checkout", {
                path: "N/A",
                title: `OnlineShop - Checkout `,
                products: products,
                total: total,
                publishable_key: PUBLISHABLE_KEY,
                sessionId: session.id
            });
        })
        .catch(err => {
            next(new Error(err));
        });

}


exports.makeOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            // to delete deleted products before making orders
            const arr = user.cart.items.filter(item => {
                if (item.productId == null) req.user.removeFromCart(item._id)
                return item.productId !== null
            });
            // keep history
            const products = arr.map(item => {
                return { quantity: item.quantity, product: { ...item.productId } };
            })
            const order = new Order({
                userId: req.user,
                products: products
            });
            return order.save();
        }).then(() => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect("/orders");
        })
        .catch(err => {
            next(new Error(err));
        });
};

// get user's orders and orders details
exports.getOrders = (req, res, next) => {
    Order.find({ 'userId': req.user._id })
        .then(orders => {
            res.render('shop/m-orders', {
                path: "/shop/orders",
                title: 'OnlineShop - My Orders',
                orders: orders
            })
        }).catch(err => {
            next(new Error(err));
        });
}

// allow user to download invoice pdf
exports.getInvoice = (req, res, next) => {
    Order.findOne({ '_id': req.params.id, 'userId': req.user._id })
        .then(order => {
            if (!order) {
                req.flash('error', 'Order not found!');
                return res.redirect('/orders');
            }
            const invoiceName = `Invoice - ${order._id}.pdf`;
            const invoicePath = path.join('puplic', 'invoices', invoiceName);
            const doc = new PDFDocument;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                'inline; filename="' + invoiceName + '"'
            );
            doc.pipe(fs.createWriteStream(invoicePath));
            doc.pipe(res);
            doc.fontSize(18).text(`Invoice - ${order._id}`, {
                align: 'center'
            });
            doc.text('-------------------------------------------------', {
                align: 'center'
            });
            let yPos = doc.y;
            doc.fontSize(14)
                .text("Product", (x = 110), (y = yPos))
                .text('Price', (x = 210), (y = yPos))
                .text('Quantity', (x = 310), (y = yPos))
                .text('Total', (x = 460), (y = yPos));
            doc.moveDown(0.5);
            let total = 0;
            order.products.map(product => {
                total += product.product.price * product.quantity;
                let yPos = doc.y;
                doc
                    .fontSize(14)
                    .text(product.product.title, (x = 110), (y = yPos))
                    .text('$' + product.product.price.toFixed(2), (x = 210), (y = yPos))
                    .text(product.quantity, (x = 310), (y = yPos))
                    .text(`${(product.quantity * product.product.price).toFixed(2)}`,
                        (x = 460),
                        (y = yPos));
            });

            doc.moveDown(1.5);
            doc.fontSize(16).text(`Total Price: $${total.toFixed(2)}`, x = 110);
            // finalize the PDF and end the stream
            doc.end();

        }).catch(err => {
            next(new Error(err));
        })

}
// exports.deleteOrder = (req, res) => {
//   Order.findByIdAndRemove(req.params.id).then(() => {
//       res.redirect("/orders");
//     })
//     .catch(err => {
//       console.log(err);
//       next(new Error(err));
//     });

// };