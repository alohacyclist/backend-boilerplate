const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const Watchlist = require("../models/Watchlist.model");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password, watchlist, createdAt } = req.body;
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        firstName,
        lastName,
        email,
        password: passwordHash,
        createdAt
      });
      // create watchlist for this user
      user.watchlist = await Watchlist.create({id: user._id})
      await user.save();
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const passwordCorrect = await bcrypt.compare(password, user.password);
      if (passwordCorrect) {
        const payload = {
          user,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });
        res.status(200).json({
          user,
          token,
        });
      } else {
        res.status(401).json({ message: "Email or password are incorrect" });
      }
    } else {
      res.status(401).json({ message: "Email or password are incorrect" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;