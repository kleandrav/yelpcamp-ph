const User = require('../models/user');

module.exports.registerForm = (req, res) => {
    res.render('users/register');
}

module.exports.registerUser = async (req, res) => {
    try
    {
        const {email, username, password} = req.body;
        const user = new User({email, username});

        // register() - convenience method to register a new user instance with a given password. Checks if username is unique. [passport-local-mongoose]
        const registeredUser = await User.register(user, password);
        // console.log(registeredUser);

        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', `Welcome to YelpCamp, ${username}!`);
            res.redirect('/campgrounds');
        });        
    }
    catch (err)
    {
        req.flash('error', err.message);
        res.redirect('register');
    }
};

module.exports.loginForm = (req, res) => {
    res.render('users/login');
};

module.exports.loginUser = (req, res) => {        
    req.flash('success', `Welcome back, ${req.user.username}!`);
    const redirectUrl = req.session.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');
};
