const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const {remove} = require('../models/user');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', async (req, res) => {
    try
    {
        const {email, username, password} = req.body;
        const user = new User({email, username});

        // register() - convenience method to register a new user instance with a given password. Checks if username is unique. [passport-local-mongoose]
        const registeredUser = await User.register(user, password);
        // console.log(registeredUser);

        req.flash('success', `Welcome to YelpCamp, ${username}!`);
        res.redirect('/campgrounds');
    }
    catch (err)
    {
        req.flash('error', err.message);
        res.redirect('register');
    }
})

router.get('/login', (req, res) => {
    res.render('users/login');
});
router.post('/login', 
    passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}),
    (req, res) => {
        req.flash('success', 'Welcome back!');
        res.redirect('/campgrounds');
});

module.exports = router;