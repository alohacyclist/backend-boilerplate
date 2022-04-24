const express = require("express")
const User = require("../models/User.model")
const Coin = require("../models/Coin.model")
const Watchlist = require("../models/Watchlist.model")
const { auth } = require("../middlewares/jwt.middleware");

const router = express.Router()

// check if coin is in userwatchlist
// edit coin model to add fractions of a coin (BONUS)


// add coin to watchlist
router.post("/watchlist", auth, async (req, res) => {
    const user =  await User.findById(req.jwtPayload.user._id)
    const watchlist = await Watchlist.findOne({_id: user.watchlist}).populate('coins')
    const coin = await Coin.create({
        name: req.body.name,
        userId: user.id,
        notes: req.body.notes,
        priceWhenAdded: req.body.priceWhenAdded,
    })
    watchlist.coins.push(coin)
    await watchlist.save()
    await user.save()
    res.status(200).json(watchlist);
});

module.exports = router;

// user: req.jwtPayload.user._id