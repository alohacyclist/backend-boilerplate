const express = require("express")
const User = require("../models/User.model")
const Coin = require("../models/Coin.model")
const Watchlist = require("../models/Watchlist.model")
const { auth } = require("../middlewares/jwt.middleware");
const e = require("express");
const router = express.Router()

// get list of all user watchlists
router.get("/", async (req, res) => {
    const watchlists = await Watchlist.find().populate([{
        path: 'id',
        model: 'User',
    }, {
        path: 'votes',
        model: 'User'
    }])
    res.status(200).json(watchlists);
})

// get a watchlist
router.get("/:id", auth, async (req, res) => {
    const watchlist = await Watchlist.findOne({id: req.params.id}).populate([{
        path: '_id',
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
router.post("/:id", auth, async (req, res) => {
    const user = await User.findById(req.jwtPayload.user._id)
    const watchlist = await Watchlist.findById(req.params.id).populate('votes')
    // check if watchlist belongs to user -> cannot like own watchlist
    if(watchlist.id != user._id) {
        // check if user already voted 
        const voteCheck = await Watchlist.findOne({votes: user})
        voteCheck?.votes?.includes(user._id) ? null : watchlist.votes.push(user._id)
        await watchlist.save()
        res.status(200).json(watchlist)
    }
})

// check watchlist for coins
router.post('/:name/check', auth, async (req, res) => {
    const coin = await Coin.find({userId: req.jwtPayload.user._id, name: req.params.name})
    coin.length > 0 ? res.send(true) :  res.send(false)
})

// remove coin from watchlist
router.post("/:id/coin", auth, async (req, res) => {
    const user = await User.findById(req.jwtPayload.user._id).populate('watchlist')
    const watchlist = await Watchlist.findOne({_id: user.watchlist}).populate('coins')
    watchlist.coins.remove(req.body.id)
    await watchlist.save()
    await user.save()
    await Coin.findByIdAndDelete(req.body.id)
    res.status(200).json(watchlist)
  });

module.exports = router;