const express = require('express');
const Topic = require('../models/Topic.cjs');
const Question = require('../models/Question.cjs');
const auth = require('../middleware/auth.cjs');

const router = express.Router();

// Get all topics for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const topics = await Topic.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get topic statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Question.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$topic',
          total: { $sum: 1 },
          revised: { $sum: { $cond: ['$isRevised', 1, 0] } }
        }
      }
    ]);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching topic stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;