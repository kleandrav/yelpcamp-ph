// import modules
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// import model
const Campground = require('../models/campground.js');
// import seed helpers
const {descriptors, places, imageUrls} = require('./seeders.js');
const cities = require('./cities.js');

// console.log(cities);

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
    await Campground.deleteMany({ author: { $in: '6064e278b6c09a2b524f6ae9' } });
    console.log('Deleted old data in campgrounds database!');

    // seeding random camps
    for (let i = 0; i < 250; i++)
    {
        let rand = Math.floor(Math.random() * 164);
        const {city, lat, lng} = cities[rand];
        const province = cities[rand].admin_name;

        // random price between 300 to 5000 pesos
        let price = 300 + Math.floor(Math.random() * 4701);

        // random images
        const randomImages = [];
        for (let j = 0; j < 4; j++) {
            randomImages.push({
                url: seeder(imageUrls),
                filename: 'Unsplash-' + uuidv4()
            });
        }
        console.log(randomImages);

        let camp = new Campground({
            name: `${seeder(descriptors)} ${seeder(places)}`,
            author: '6064e278b6c09a2b524f6ae9', // Own user _id
            price: price,
            description: "With more than 7,000 islands consisting of rice paddies, volcanos, hills, mountains, cliffs, world-class surf spots, and endemic wildlife, the Philippines is one of the most dazzling and diverse countries in all of Asia. Not to mention, it’s home to some of the world’s best beaches, too. The country is a biodiversity hotspot, having the world’s highest endemism rate for bird species, and one of the highest for mammals and flora. (travelope.in)",
            location: `${city}, ${province}`,
            images: [ ...randomImages ],
            geometry: {
                type: "Point",
                coordinates: [lng, lat]
            }
        });
        await camp.save();
        console.log('Camp Saved:', camp);
    }
}

seedDB().then( () => mongoose.connection.close() );
