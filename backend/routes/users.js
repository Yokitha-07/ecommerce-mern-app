const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { authorize } = require('../middleware/auth');

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private (admin)
 */
router.get('/', authorize(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      success: true,
      data: users,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (admin only)
 * @access  Private (admin)
 */
router.get('/:id', authorize(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID.' });
    }
    res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * @route   POST /api/users/create
 * @desc    Create new user (admin only)
 * @access  Private (admin)
 */
router.post('/create', authorize(['admin']), async (req, res) => {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const validRoles = ['admin', 'marketing', 'content', 'sales', 'customer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists.' });
    }
    res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user (admin only)
 * @access  Private (admin)
 */
router.put('/:id', authorize(['admin']), async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Update name
    if (name) {
      user.name = name;
    }

    // Update email (check for duplicates)
    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ error: 'Email already in use.' });
      }
      user.email = email.toLowerCase();
    }

    // Update role
    if (role) {
      const validRoles = ['admin', 'marketing', 'content', 'sales', 'customer'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
      }
      user.role = role;
      // Permissions will be auto-updated by pre-save hook
    }

    // Update password if provided
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }
      const saltRounds = 10;
      user.passwordHash = await bcrypt.hash(password, saltRounds);
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select('-passwordHash');

    res.json({
      success: true,
      message: 'User updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID.' });
    }
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists.' });
    }
    res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (admin only)
 * @access  Private (admin)
 */
router.delete('/:id', authorize(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID.' });
    }
    res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * @route   GET /api/users/stats/roles
 * @desc    Get user count by role (admin only)
 * @access  Private (admin)
 */
router.get('/stats/roles', authorize(['admin']), async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
