const express = require('express');
const Question = require('../models/Question.cjs');
const Topic = require('../models/Topic.cjs');
const auth = require('../middleware/auth.cjs');

const router = express.Router();

// Get all questions for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const questions = await Question.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new question
router.post('/', auth, async (req, res) => {
  try {
    const { name, topic, difficulty, code, notes } = req.body;

    // Create or find topic
    let topicDoc = await Topic.findOne({ 
      name: topic, 
      userId: req.user._id 
    });
    
    if (!topicDoc) {
      topicDoc = new Topic({ 
        name: topic, 
        userId: req.user._id 
      });
      await topicDoc.save();
    }

    // Create question
    const question = new Question({
      name,
      topic,
      difficulty,
      code: code || '',
      notes: notes || '',
      userId: req.user._id
    });

    await question.save();
    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a question
router.put('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const updates = req.body;
    
    // If topic is being changed, ensure the new topic exists
    if (updates.topic && updates.topic !== question.topic) {
      let topicDoc = await Topic.findOne({ 
        name: updates.topic, 
        userId: req.user._id 
      });
      
      if (!topicDoc) {
        topicDoc = new Topic({ 
          name: updates.topic, 
          userId: req.user._id 
        });
        await topicDoc.save();
      }
    }

    Object.assign(question, updates);
    await question.save();
    
    res.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a question
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get random questions for revision
router.get('/random/:count', auth, async (req, res) => {
  try {
    const count = parseInt(req.params.count) || 5;
    const questions = await Question.aggregate([
      { $match: { userId: req.user._id } },
      { $sample: { size: count } }
    ]);
    
    res.json(questions);
  } catch (error) {
    console.error('Error fetching random questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;