const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", async (req, res) => {
  const hash = await bcrypt.hash(
    req.body.password,
    parseInt(process.env.SECRET_CODE)
  );

  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: hash,
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json(error);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.body.username,
    });
    !user && res.status(401).json("Username not found!");

    const hashedPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    !hashedPassword && res.status(401).json("Wrong Password!");

    const accessToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.SECRET_CODE,
      { expiresIn: "3d" }
    );

    const { password, ...others } = user._doc;
    res.status(200).json({ others, accessToken });
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
