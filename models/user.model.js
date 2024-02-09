const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        user_id: {
            type: Number,
            required: true,
            unique: true,
        },
        user_name: {
            type: String,
            required: true,
        },
        balance: {
            type: Number,
            required: true,
        }
        
    },
    { versionKey: false }
);

module.exports = mongoose.model("User", userSchema);