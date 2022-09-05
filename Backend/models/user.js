const mongoose = require('mongoose')


const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    street: {
        type: String,
        default: ''
    },
    apartment: {
        type: String,
        default: ''
    },
    zip: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
});

//to change _id to id in order to use the back for any application
userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
userSchema.set('toJSON', {
    virtuals: true
});


exports.User = mongoose.model('User', userSchema)
exports.userSchema = userSchema


// {
  
//     "name": "ELisha Oderinde",
//     "email": "elishaibukun@gmail.com",
//     "password": "123456",
//     "phone": "08148645867",
//     "isAdmin": "true",
//     "apartment": "Hostel underH",
//     "street": "UnderG",
//     "zip": "10015",
//     "city": "Ogbomoso",
//     "country": "Nigeria",
// }