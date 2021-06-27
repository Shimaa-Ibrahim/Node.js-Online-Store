const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session")
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');

dotenv.config();


//const hbs = require("express-handlebars");
const User = require("./models/mongodb_models/users")
// const mongodb = require('./util/mongoDatabase');
const MONGO_URI = process.env.MONGO_URI;
//routes
const adminRouter = require("./routes/mongoRoutes/admin");
const shopRouter = require("./routes/mongoRoutes/shop");
const authRouter = require("./routes/mongoRoutes/auth");

const port = process.env.PORT || 4000;
const app = express();
// app.use(helmet());
// app.use(compression());

const store = new MongoDBStore({
  uri: MONGO_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'public/images');
  },
  filename: (req, file, cb) =>{
    // for windows .replace(/:/g, '-')
    cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if ( 
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
      ){
    cb(null, true);
  }
  else {
    cb(null, false);
  }
}

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
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('imageURL'));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret : 'abcdeffedcba',
  resave : false,
  saveUninitialized : false,
  store : store 
}));
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if(!user){
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      console.log(err);
      next(new Error(err));
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.isAdmin = req.session.isAdmin;
  res.locals.csrfToken = req.csrfToken();
  next();
});


//routes
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/", shopRouter);

// error handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).render("errors/500"); 
});
// 404 error
app.use((req, res) => {
  // res.status(404).sendFile(path.join(rootDirPath,'views', '404Error.html')); //serve static html
  // res.render('404',{layout:false}); //serve using handlebars templete engine
  res.status(404).render("errors/404"); //serve using other templete engines
});

mongoose
  .connect(MONGO_URI, {
    useUnifiedTopology: true, 
    useNewUrlParser: true, 
    useFindAndModify: false,
    useCreateIndex: true 
  })
  .then(() => {
    console.log("connected to db");
    app.listen(port, err => {
      if (!err) console.log(`start new server on port ${port}`);
    });
  })
  .catch(err => {
    console.log(err);
    next(new Error(err));
  });
