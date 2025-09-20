const  mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
user_id: { type: String, required: true, unique: true },
name: { type: String, required: true },
email: { type: String, required: true, unique: true },
phone: { type: String, required: true, unique: true },
roles: { type: [String], default: ['user'] },
createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('User', userSchema);