const express = require("express")
const User = require("../models/User.model")
const Watchlist = require("../models/Watchlist.model")
const { auth } = require("../middlewares/jwt.middleware");


const router = express.Router()

// get user profile
router.get("/profile", auth, async (req, res) => {
    const user = await User.findById(req.jwtPayload.user).populate([{
        path: 'watchlist',
        model: 'Watchlist',
    }]);
    res.status(200).json(user);
  });

module.exports = router;
