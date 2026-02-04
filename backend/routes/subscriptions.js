const express = require('express');
const { body, validationResult } = require('express-validator');
const EmailSubscription = require('../models/EmailSubscription');
const Event = require('../models/Event');

const router = express.Router();

router.post('/', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('eventId').isMongoId().withMessage('Valid event ID is required'),
  body('consent').isBoolean().equals('true').withMessage('Consent is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, eventId, consent } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const subscription = await EmailSubscription.create({
      email,
      eventId,
      consent,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      message: 'Subscription successful',
      subscription: {
        email: subscription.email,
        eventId: subscription.eventId,
        subscribedAt: subscription.subscribedAt
      }
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Email already subscribed to this event' });
    }
    
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

router.get('/email/:email', async function(req, res) {
  try {
    const { email } = req.params;
    
    const subscriptions = await EmailSubscription.find({ email })
      .populate('eventId', 'title dateTime venueName')
      .sort({ subscribedAt: -1 });

    res.json({ subscriptions });
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

router.get('/event/:eventId', async function(req, res) {
  try {
    const { eventId } = req.params;
    
    const subscriptions = await EmailSubscription.find({ eventId })
      .sort({ subscribedAt: -1 });

    res.json({ subscriptions });
  } catch (error) {
    console.error('Error getting event subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

module.exports = router;
