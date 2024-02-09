// train.model.js
const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
    station_id: {
        type: Number,
        required: true
    },
    arrival_time: {
        type: String,
        default: null
    },
    departure_time: {
        type: String,
        default: null
    },
    fare: {
        type: Number,
        required: true
    }
});

const trainSchema = new mongoose.Schema({
    train_id: {
        type: Number,
        required: true,
        unique: true
    },
    train_name: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    stops: {
        type: [stopSchema],
        required: true
    }
});

module.exports = mongoose.model('Train', trainSchema);


