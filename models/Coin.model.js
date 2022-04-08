const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const coinSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
    },
    priceWhenAdded: {
        type: Number,
        required: true,
    },
    addedAt: { 
        type: Date,
        default: Date.now,
        immutable: true,
    },
    editedAt: {
        type: Date,
        default: Date.now,
        immutable: true,
    }
});

const Coin = model("Coin", coinSchema);

module.exports = Coin;
