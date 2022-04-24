const express = require("express")
const User = require("../models/User.model")
const Watchlist = require("../models/Watchlist.model")
const { auth } = require("../middlewares/jwt.middleware");
const bcrypt = require("bcrypt");

const router = express.Router()

// get user profile
router.get("/profile", auth, async (req, res) => {
    const user = await User.findById(req.jwtPayload.user)
    res.status(200).json(user);
  });

router.post('/profile', auth, async (req, res) => {
  const {email, password} = req.body
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.findByIdAndUpdate(req.jwtPayload.user, {email: email, password: passwordHash}, {new: true})
  await user.save()
  res.status(200).json(user)
})

// get user watchlist
router.get("/watchlist/:id", auth, async (req, res) => {
  const watchlist = await Watchlist.findOne({id: req.params.id}).populate([{
      path: 'coins',
      model: 'Coin'
  }, {
      path: 'votes',
      model: 'User'
  }]);
  res.status(200).json(watchlist);
})

module.exports = router;
