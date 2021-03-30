const mongoose = require('mongoose');
const {Schema} = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// this creates username & password fields in the UserSchema
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
