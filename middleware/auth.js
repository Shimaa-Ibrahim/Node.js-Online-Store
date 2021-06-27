exports.isNotLoggedIn = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/auth/login');
    }
    next();
}

exports.isLoggedIn = (req, res, next) => {
    if (req.session.isLoggedIn){
        return res.redirect('/');
    }
    next();
}

exports.isAdmin = (req, res, next) => {
    if(!req.session.isAdmin){
        return res.render('errors/401');
    }
    next();
}