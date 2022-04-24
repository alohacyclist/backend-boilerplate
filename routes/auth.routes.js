const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const Watchlist = require("../models/Watchlist.model");
const { auth } = require('../middlewares/jwt.middleware')
const { v4: uuidv4 } = require('uuid')
const sendEmail = require('../utils/sendEmail')

const router = express.Router();

router.post("/signup", async (req, res) => {
  // create unique confirmation code
  const confirmationCode = uuidv4()
  // link that is send to the user
  const confirmationLink = `http://localhost:4000/auth/${confirmationCode}`
  const { firstName, lastName, email, password, watchlist, createdAt } = req.body;
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ 
        firstName,
        lastName,
        email,
        password: passwordHash,
        createdAt,
        confirmationCode: confirmationCode 
      });
      sendEmail(user.email, 'Confirm your Blocker Account', confirmationLink)
      // create watchlist for this user
      user.watchlist = await Watchlist.create({id: user._id})
      await user.save();
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
});

router.get('/:confirmationCode', async (req, res) => {
  const user = await User.findOne({confirmationCode: req.params.confirmationCode})
  try {
    if(user) {
      user.status = true
      await user.save()
      console.log(user, 'confirmation successful')
      res.redirect(`${process.env.BLOCKER_PAGE}`)
    }
  } catch (error) {
    res.status(401).json(error)
  }
})

router.get("/verify", auth, (req, res) => {
  res.status(200).json({
    user: req.jwtPayload.user,
  })
})

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      if (user.status === true) {
        const passwordCorrect = await bcrypt.compare(password, user.password);
      if (passwordCorrect) {
        const payload = {
          user,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          algorithm: "HS256",
          expiresIn: "3h",
        });
        res.status(200).json({
          user,
          token,
        });
      } else {
        res.status(401).json({ message: "Email or password are incorrect" });
      }
    } else {
      res.status(401).json({ message: "Account not verified. Check your mails for activation link." });
    }
      }
        } catch (error) {
            res.status(500).json(error);
        }
});

module.exports = router;
