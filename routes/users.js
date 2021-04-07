// imports
const express = require('express');
const passport = require('passport');
const router = express.Router();
const userControls = require('../controllers/users');
const { requireLogIn } = require('../utils/middleware.js');
const catchAsync = require('../utils/catchAsync.js');

router.route('/register')
    .get( userControls.registerForm )
    .post( catchAsync( userControls.registerUser ));

router.route('/login')
    .get( userControls.loginForm )
    .post( 
        // If passport.authenticate() succeeds, the next handler will be invoked 
        // and the req.user property will be set to the authenticated user.
        passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}),
        userControls.loginUser 
        );

router.get('/logout', userControls.logoutUser );

router.get('/mycampgrounds', requireLogIn, userControls.userCampgrounds );

module.exports = router;
