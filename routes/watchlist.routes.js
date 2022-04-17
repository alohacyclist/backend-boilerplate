const express = require("express")
const User = require("../models/User.model")
const Coin = require("../models/Coin.model")
const Watchlist = require("../models/Watchlist.model")
const { auth } = require("../middlewares/jwt.middleware");
const router = express.Router()

// get list of all user watchlists
router.get("/", auth, async (req, res) => {
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
router.post("/:id", auth, async (req, res) => {
    const user = await User.findById(req.jwtPayload.user._id)
    const watchlist = await Watchlist.find({id: req.params.id}).populate('votes')
    console.log(watchlist[0].votes)
    watchlist[0].votes.push(user._id)
    await watchlist[0].save()
    res.status(200).json(watchlist)
})

// remove coin from watchlist
router.post("/:id/coin", auth, async (req, res) => {
    const user = await User.findById(req.jwtPayload.user._id).populate('watchlist')
    const watchlist = await Watchlist.findOne({_id: user.watchlist}).populate('coins')
    watchlist.coins.remove(req.body.id)
    await watchlist.save()
    await user.save()
    const coin = await Coin.findByIdAndDelete(req.body.id)
    res.status(200).json(watchlist)
  });

module.exports = router;