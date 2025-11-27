import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.get('/:email', async (req, res) => {
  try {
    let user = await User.findOne({ email: req.params.email });
    if (!user) {
      user = await User.create({ email: req.params.email });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:email/watchlist', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { $set: { watchlist: req.body.watchlist } },
      { new: true, upsert: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:email/preferences', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { $set: { preferences: req.body.preferences } },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
