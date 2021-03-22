const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const campground = require('./models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Database Connected!'))
    .catch(err => console.log('Mongoose Connection Error:', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// parse req.body from a form POST request
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.render('home');
});

// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({
//         title: 'my 2nd backyard',
//         description: 'really cheap camping!',
//         price: 0,
//         location: 'my home'
//     });
//     await camp.save();
//     res.send(camp);
// });

// Show All route
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    console.log(campgrounds);
    res.render('campgrounds/index', {campgrounds});
});

// Create route
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

app.listen(8080, () => {
    console.log("Server's open on port 8080")
});
