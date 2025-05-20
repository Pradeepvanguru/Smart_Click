const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { MongoClient } = require('mongodb');
const Authentication = require('../middleware/AuthMiddleWare');

// MongoDB setup
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

// Register
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Generate possible collection name
    const expectedCollectionPrefix = `collection_${user.email}_`;

    // Connect to DB and check if a collection exists for that user
    await client.connect();
    const db = client.db('Resume');
    const collections = await db.listCollections().toArray();
    const userCollection = collections.find((col) =>
      col.name.startsWith(expectedCollectionPrefix)
    );

    const collectionName = userCollection ? userCollection.name : null;

    res.json({
      token,
      user: { name: user.name, email: user.email },
      collectionName, // will be null if not found
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/delete-account', Authentication, (req, res) => {
  const email = req.userEmail; // Safely access the email

  if (!email) {
    return res.status(400).json({ msg: 'Email is required' });
  }

  User.findOneAndDelete({ email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      res.json({ msg: 'User deleted successfully' });
    })
    .catch((err) => {
      console.error('Delete error:', err);
      res.status(500).json({ msg: 'Server error' });
    });
});


module.exports = router;
