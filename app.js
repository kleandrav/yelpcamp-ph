// import modules
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

// model or schema
const Campground = require('./models/campground');

// express app
const app = express();

// connect mongoose to mongodb
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Database Connected!'))
    .catch(err => console.log('Mongoose Connection Error:', err));

// ejs-mate
app.engine('ejs', ejsMate);

// setup EJS & views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// parse req.body from a form POST request
app.use(express.urlencoded({extended: true}));
// method override for put / delete request
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.render('home');
});

// Show All route
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    // console.log(campgrounds);
    res.render('campgrounds/index', {campgrounds});
});

// Create routes
app.get('/campgrounds/new', async (req, res) => {
    res.render('campgrounds/new');
});
app.post('/campgrounds', async (req, res) => {
    const camp = new Campground(req.body);
    console.log('New Camp:', camp);
    // res.send(req.body);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
});

// Show 1 route
app.get('/campgrounds/:id', async (req, res) => {
    // console.log(req.params);
    const camp = await Campground.findById(req.params.id);
    // console.log(camp);
    res.render('campgrounds/show', {camp});
});

// Update routes
app.get('/campgrounds/:id/edit', async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    res.render(`campgrounds/edit`, {camp})
});
app.put('/campgrounds/:id', async (req, res) => {
    // res.send(req.body);
    // const camp = await Campground.findByIdAndUpdate(req.params.id, req.body, {new: true});
    // console.log('Updated Camp:', camp)
    await Campground.findByIdAndUpdate(req.params.id, req.body);
    res.redirect(`/campgrounds/${req.params.id}`);
});

// Delete route
app.delete('/campgrounds/:id', async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
});

app.listen(8080, () => {
    console.log("Server's open on port 8080")
});
