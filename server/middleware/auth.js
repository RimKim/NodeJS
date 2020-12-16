const { User } = require('../models/User');

let auth = (req, res, next) => {
    //do authentication; verify user

    // retrieve token from Cookies
    let token = req.cookies.x_auth;

    // decode Token and find userid
    User.findByToken(token, (err, user) => {
        if (err) throw err;
        if (!user) 
            return res.json({
                isAuth: false,
                error: true
            });

        // authentification successful
        req.token = token;
        req.user = user;
        next();
    });
};

module.exports = { auth };