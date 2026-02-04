const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Event = require('../models/Event');
const authService = require('../services/authService');

const router = express.Router();

const authenticateToken = async function(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = authService.verifyToken(token);
    req.user = await authService.getUserById(decoded.userId);
    
    if (!req.user) {
      return res.status(401).json({ error: 'User not found' });
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('city').optional().isString().trim(),
  query('category').optional().isString().trim(),
  query('search').optional().isString().trim(),
  query('status').optional().isIn(['new', 'updated', 'inactive', 'imported']).withMessage('Invalid status'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      city,
      category,
      search,
      status,
      startDate,
      endDate,
      sortBy = 'dateTime',
      sortOrder = 'asc'
    } = req.query;

    const filter = {};
    
    if (city) filter.city = new RegExp(city, 'i');
    if (category) filter.category = new RegExp(category, 'i');
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.dateTime = {};
      if (startDate) filter.dateTime.$gte = new Date(startDate);
      if (endDate) filter.dateTime.$lte = new Date(endDate);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const events = await Event.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Event.countDocuments(filter);

    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.get('/:id', async function(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    console.error('Error getting event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

router.post('/', authenticateToken, [
  body('title').notEmpty().trim().isLength({ max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').notEmpty().trim().isLength({ max: 2000 }).withMessage('Description is required and must be less than 2000 characters'),
  body('dateTime').isISO8601().withMessage('Valid date and time is required'),
  body('venueName').notEmpty().trim().withMessage('Venue name is required'),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('category').optional().trim(),
  body('tags').optional().isArray(),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
  body('originalEventUrl').isURL().withMessage('Valid source URL is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      ...req.body,
      source: 'manual',
      status: 'new',
      lastScrapedAt: new Date()
    };

    const event = await Event.create(eventData);
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

router.post('/:id/import', authenticateToken, [
  body('importNotes').optional().isString().trim().isLength({ max: 500 }).withMessage('Import notes must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Import validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { importNotes } = req.body;
    const eventId = req.params.id;
    
    console.log('Importing event:', eventId, 'by user:', req.user._id);

    const event = await Event.findById(eventId);
    
    if (!event) {
      console.log('Event not found:', eventId);
      return res.status(404).json({ error: 'Event not found' });
    }

    event.status = 'imported';
    event.importedAt = new Date();
    event.importedBy = req.user._id;
    if (importNotes) event.importNotes = importNotes;

    await event.save();
    
    console.log('Event imported successfully:', eventId);

    res.json({ 
      message: 'Event imported successfully',
      event 
    });
  } catch (error) {
    console.error('Error importing event:', error);
    res.status(500).json({ error: 'Failed to import event' });
  }
});

router.get('/dashboard/all', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['new', 'updated', 'inactive', 'imported']),
  query('search').optional().isString().trim(),
  query('city').optional().isString().trim(),
  query('category').optional().isString().trim(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 50,
      status,
      search,
      city,
      category,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (city) filter.city = new RegExp(city, 'i');
    if (category) filter.category = new RegExp(category, 'i');
    
    if (startDate || endDate) {
      filter.dateTime = {};
      if (startDate) filter.dateTime.$gte = new Date(startDate);
      if (endDate) filter.dateTime.$lte = new Date(endDate);
    }

    if (search) {
      filter.$text = { $search: search };
    }

  
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const events = await Event.find(filter)
      .populate('importedBy', 'displayName email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Event.countDocuments(filter);

    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting dashboard events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.get('/dashboard/stats', authenticateToken, async function(req, res) {
  try {
    const stats = await Event.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalEvents = await Event.countDocuments();
    const importedThisWeek = await Event.countDocuments({
      status: 'imported',
      importedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      totalEvents,
      importedThisWeek,
      statusBreakdown: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Error getting event stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

router.delete('/:id', authenticateToken, async function(req, res) {
  try {
    const eventId = req.params.id;
    
    console.log('Deleting event:', eventId, 'by user:', req.user._id);

    const event = await Event.findById(eventId);
    
    if (!event) {
      console.log('Event not found for deletion:', eventId);
      return res.status(404).json({ error: 'Event not found' });
    }

    await Event.findByIdAndDelete(eventId);
    
    console.log('Event deleted successfully:', eventId);

    res.json({ 
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;
