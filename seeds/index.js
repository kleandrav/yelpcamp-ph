// import modules
const mongoose = require('mongoose');
// import model
const Campground = require('../models/campground.js');
// import seed helpers
const {descriptors, places} = require('./seeders.js');
const cities = require('./cities.js');

console.log(cities);

// connect mongoose to database
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Database Connected'))
    .catch(err => console.log('Mongoose Connection Error:', err));

// function to return a random element in an array
const seeder = arr => arr[Math.floor(Math.random() * arr.length)];

// seeding
const seedDB = async () => {
    // delete existing data
    await Campground.deleteMany({});
    console.log('Deleted old data in campgrounds database');
    // seeding random camps
    for (let i = 0; i < 30; i++)
    {
        let rand = Math.floor(Math.random() * 164);
        let price = 500 + Math.floor(Math.random() * 9500);
        // console.log(`~${rand}~ ${cities[rand].city}, ${cities[rand].admin_name}`);
        // console.log(seeder(descriptors));
        // console.log(seeder(places));
        let camp = new Campground({
            name: `${seeder(descriptors)} ${seeder(places)}`,
            price: price,
            description: "With more than 7,000 islands consisting of rice paddies, volcanos, mega-metropolises, world-class surf spots, and endemic wildlife, the Philippines is one of the most dazzling and diverse countries in all of Asia.",
            location: `${cities[rand].city}, ${cities[rand].admin_name}`
        })
        await camp.save();
        console.log('Camp Saved:', camp);
    }
}

seedDB().then( () => mongoose.connection.close() );
