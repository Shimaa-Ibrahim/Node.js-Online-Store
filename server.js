const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
var session = require("express-session");
var SequelizeStore = require("connect-session-sequelize")(session.Store);
const csrf = require('csurf');
const flash = require('connect-flash');

//const hbs = require("express-handlebars");

//routes
const authRouter = require('./routes/sqlRoutes/auth');
const adminRouter = require('./routes/sqlRoutes/admin');
const shopRouter = require('./routes/sqlRoutes/shop');

//models
const sequelize = require("./util/sqlDatabase");
const User = require("./models/sql_models/users");
const Products = require("./models/sql_models/products");
const Order = require("./models/sql_models/order");
const OrderItems = require("./models/sql_models/order_items");
const Cart = require("./models/sql_models/cart");
const CartItems = require("./models/sql_models/cart_items");

const port = process.env.port || 3000;
const app = express();

const store = new SequelizeStore({
  db: sequelize
});
const csrfProtection = csrf();

/* using diff templete engines

app.set('view engine', 'pug'); //using pug templete engine

using handlebars templete engine:
app.engine('hbs',hbs({
    layoutsDir: 'views/layouts',
    defaultLayout: 'main-layout',
    extname: 'hbs'
}));
app.set('view engine', 'hbs'); 
*/

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: 'abcdeffedcba',
  resave: false,
  saveUninitialized: false,
  store: store
}));

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findByPk(req.session.user.id)
    .then(user => {
      if(!user){
        return next();
      }
        req.user = user;
        return user.getCart();
      }).then(cart =>{
        if(!cart){
          return req.user.createCart();
        }
        return cart;
      }).then(()=>{
        next();
      })
    .catch(err => {
      console.log(err);
      next(new Error(err));
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});


//routes
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/", shopRouter);

// error handler
app.use((err, req, res, next) => {
  res.status(500).render("errors/500"); 
});
// 404 error
app.use((req, res) => {
  // res.status(404).sendFile(path.join(rootDirPath,'views', '404Error.html')); //serve static html
  // res.render('404',{layout:false}); //serve using handlebars templete engine
  res.status(404).render("errors/404"); //serve using other templete engines
});

//models relations
Products.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Products);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Products, { through: CartItems });
Products.belongsToMany(Cart, { through: CartItems });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Products, { through: OrderItems });
Products.belongsToMany(Order, { through: OrderItems });


sequelize
  .sync().then(() => {
    app.listen(port, (err) => {
      if (!err) console.log(`start new server on port ${port}`);
  })
})
  .catch(err => {
    console.log(err);
    next(new Error(err));
  });
