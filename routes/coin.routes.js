const express = require("express")
const User = require("../models/User.model")
const Coin = require("../models/Coin.model")
const Watchlist = require("../models/Watchlist.model")
const { auth } = require("../middlewares/jwt.middleware");

const router = express.Router()

// add coin to watchlist
router.post("/watchlist", auth, async (req, res) => {
    const user =  await User.findById(req.jwtPayload.user._id)
    const watchlist = await Watchlist.findOne(req.jwtPayload.user.id)
    const coin = await Coin.create({
        name: req.body.name,
        userId: user.id,
        notes: req.body.notes,
        priceWhenAdded: req.body.priceWhenAdded,
    })
    
    watchlist.coins.push(coin)
    await watchlist.save()

    res.status(200).json(watchlist);
});

// get coin details if in user watchlist
/* router.get('/:id', async (req, res) => {
    const { coinId } = req.params
    const user = await User.findOne(req.jwtPayload.user._id)
    const watchlist = await Watchlist.findById(req.jwtPayload.user.watchlist.id)
    watchlist.find(coin => coin.id === coinId)
    res.status(200).json(user, watchlist.coins)
}) */

module.exports = router;

// user: req.jwtPayload.user._id