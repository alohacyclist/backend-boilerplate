const express = require("express")
const User = require("../models/User.model")
const Coin = require("../models/Coin.model")
const Watchlist = require("../models/Watchlist.model")
const { auth } = require("../middlewares/jwt.middleware");
const router = express.Router()

// get list of all user watchlists
router.get("/", auth, async (req, res) => {
    const watchlists = await Watchlist.find().populate([{
        path: 'user',
        model: 'User',
    }, {
        path: 'votes',
        model: 'User'
    }])
    res.status(200).json(watchlists);
})

// get a watchlist
router.get("/:id", auth, async (req, res) => {
    const watchlist = await Watchlist.findById(req.params.id).populate([{
        path: 'id',
        model: 'User',
    }, {
        path: 'coins',
        model: 'Coin'
    }, {
        path: 'votes',
        model: 'User'
    }]);
    res.status(200).json(watchlist);
})

// vote/like/watch a watchlist
/* router.get("/:id", auth, async (req, res) => {
    const user = req.jwtPayload.user._id
    const watchlist = await Watchlist.findByIdAndUpdate(req.params.id, {votes: {user}}, {new: true})
    res.status(200).json(watchlist)
}) */

// remove coin from watchlist
router.delete("/:id/coin/:id", async (req, res) => {
    const { id } = req.params;
    const coin = await Coin.findByIdAndDelete(id);
    res.status(200).json(coin);
  });

module.exports = router;