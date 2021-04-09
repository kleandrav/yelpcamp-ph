// config
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const port = process.env.PORT || 8080;

// import modules
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalPassport = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

// express app
const app = express();

//import models
const User = require('./models/user');

//import utilities
const ExpressError = require('./utils/ExpressError.js');
const {
    scriptSrcUrls,
    styleSrcUrls,
    connectSrcUrls,
    fontSrcUrls
} = require('./utils/cspUrls.js');

// import routes 
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

// connect mongoose to mongodb
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// const dbUrl = 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    .then(() => console.log('Database Connected!'))
    .catch(err => console.log('Mongoose Connection Error:', err));

// ejs-mate
app.engine('ejs', ejsMate);

// setup EJS
app.set('view engine', 'ejs');

// directories
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// parse req.body from a form POST request
app.use(express.urlencoded({
    extended: true
}));

// method override for put / delete request
app.use(methodOverride('_method'));

// replace prohibited characters with _ for security
app.use(mongoSanitize({
    replaceWith: '_'
}));

// basic security
app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/kleandrav/", // own cloudinary account
                "https://images.unsplash.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Morgan
app.use(morgan('tiny'));

// Express Session & Mongo Store
const secret = process.env.SECRET || 'yourdeepestdarkestsecret';
const store = new MongoStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60 //24 hours
});
store.on('error', e => {
    console.log('SESSION STORE ERROR', e);
});
const sessionConfig = {
    store: store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        // session expires in 8 days:
        expires: Date.now() + 1000 * 60 * 60 * 24 * 8,
        maxAge: 1000 * 60 * 60 * 24 * 8
    }
}
app.use(session(sessionConfig));

app.use(flash()); // flash middleware

// PASSPORT.js
app.use(passport.initialize());
app.use(passport.session()); // supports persistent login sessions

// Using static methods brought to us by passport-local-mongoose:
// use static authenticate method of User model in LocalStrategy
passport.use(new LocalPassport(User.authenticate()));
// use static serialize and deserialize of User model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // console.log( 'From main app:', req.query );
    res.locals.currentUser = req.user;
    console.log("User: ", res.locals.currentUser );
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// Home Page
app.get('/', (req, res) => {
    res.render('home');
});

// Express Router
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes)

// 404
app.all('*', (req, res, next) => {
    next(new ExpressError(404, 'Page Not Found'));
});

// simple error handler
app.use((err, req, res, next) => {
    if (!err.status) err.status = 400;
    if (!err.message) err.message = 'Something went wrong';
    res.render('error', {
        err
    });
});

app.listen(port, () => {
    console.log(`Server's open on port ${port}!`);
});