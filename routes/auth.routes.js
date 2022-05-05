const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const Watchlist = require("../models/Watchlist.model");
const ResetPasswordToken = require("../models/ResetPasswordToken.model");
const { auth } = require('../middlewares/jwt.middleware')
const { v4: uuidv4 } = require('uuid')
const sendEmail = require('../utils/sendEmail')

const router = express.Router();

router.post("/signup", async (req, res) => {
  // create unique confirmation code
  const confirmationCode = uuidv4()
  // link that is send to the user
  const confirmationLink = `https://blockerapp.herokuapp.com/auth/${confirmationCode}`
  const { firstName, lastName, email, password, createdAt } = req.body;
  const checkUser = await User.findOne({email: req.body.email})
  if(checkUser) res.status(200).json(checkUser)
  if(!checkUser) {
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
      await sendEmail(user.email, 'Confirm your Blocker Account', `Welcome to BLOCKER,\n please click the Link below to verify your Account.\n ${confirmationLink}`)
      // create watchlist for this user
      user.watchlist = await Watchlist.create({id: user._id})
      await user.save();
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
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

router.post("/verify", auth, (req, res) => {
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

//delete account (and associated watchlist)
router.post('/delete', async (req, res) => {
  const { user } = req.body
  await User.findByIdAndDelete(user._id)
  await Watchlist.findOneAndDelete({id: user._id})
})

// route to request and create unique token to set a new password
router.post('/password-reset', async (req, res) => {
  if(req.body.email === '')  res.status(400).send('Please enter your E-Mail.')
  const user = await User.findOne({ email: req.body.email });
    try{
        if (!user) return res.status(400).send("No user with that E-Mail.");

        let token = await ResetPasswordToken.findOne({ userId: user._id });
        if (!token) {
            token = await ResetPasswordToken.create({
                userId: user._id,
                token: uuidv4(),
            })
            await token.save()
        }

        const link = `https://blockerapp.herokuapp.com/auth/reset-password/${user._id}/${token.token}`;
        await sendEmail(user.email, "Password reset", link);

        res.status(200).send(`Reset-Password-Link sent to ${user.email}.`);
    } catch (error) {
        res.send("An error occured");
        console.log(error);
    }
  })

  // route to verify user id and token to reset password
  router.get('/reset-password/:userId/:resetPasswordToken', async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(400).send("Invalid link or expired");

      const token = await ResetPasswordToken.findOne({
          userId: user._id,
          token: req.params.resetPasswordToken,
      });
      if (!token) return res.status(400).send("Invalid link or expired");

      console.log('user and token:', user, token)
      res.status(200).send('All good!')
  } catch (error) {
      res.send("Token invalid or expired.");
      console.log(error);
  }
  })

router.post(('/password-reset/:userId'), async (req, res) => {
  const passwordHash = await bcrypt.hash(req.body.password, 10)
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, {
      password: passwordHash
    })
    console.log('user password updated:', user)
    res.status(200).json(user)
  } catch {
    res.status(401).send('password could not be updated')
  }
})

router.post("/google-login", async (req, res) => {
  const {firstName, lastName, email} = req.body
  try {
    const user = await User.findOne( {email} );
    if (user) {
      const payload = {
        user,
      }
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: "3h",
      });
      res.status(200).json({
        user,
        token,
      });
      console.log('user in database, jwt created:', user)
    } else {
      const passwordHash = await bcrypt.hash("fuckpasswords", 10);

      const user = await User.create({
        firstName,
        lastName,
        email,
        status: true,
        password: passwordHash,
      })
      console.log('new google user created:', user)

      sendEmail(user.email, 'Welcome to Blocker', 'Please go to your profile and set a password.')

      user.watchlist = await Watchlist.create({id: user._id})
      await user.save();
      
      const payload = {
        user,
      }
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: "3h",
      });
      
      res.status(200).json({
        user,
        token
      });
    }

  } catch (error) {
    res.status(500).json(error);
    }
});

module.exports = router;
