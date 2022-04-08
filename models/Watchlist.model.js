const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const watchlistSchema = new Schema({
    id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'User',
    },
    coins: {
        type: [mongoose.SchemaTypes.ObjectId],
        default: [],
        ref: 'Coin',
    },
    votes: {
        type: [mongoose.SchemaTypes.ObjectId],
        default: [],
        ref: 'User',
    },
    updatedAt: { 
        type: Date,
        default: Date.now,
        immutable: true,
      },
    createdAt: { 
        type: Date,
        default: Date.now,
        immutable: true,
      }
});

const Watchlist = model("Watchlist", watchlistSchema);

module.exports = Watchlist;