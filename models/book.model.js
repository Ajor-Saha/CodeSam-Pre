const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
            required: true,
            unique: false,
        },
        title: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            required: true,
        },
        genre: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        }
        
    },
    { versionKey: false }
);

module.exports = mongoose.model("Book", bookSchema);