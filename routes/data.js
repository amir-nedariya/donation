const express = require('express');
const { body, validationResult } = require('express-validator');
const MonthlyData = require('../models/MonthlyData');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all monthly data (accessible to all authenticated users)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const data = await MonthlyData.find()
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await MonthlyData.countDocuments();

    res.json({
      data,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single monthly data record
router.get('/:id', auth, async (req, res) => {
  try {
    const data = await MonthlyData.findById(req.params.id)
      .populate('createdBy', 'username email');

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new monthly data (admin only)
router.post('/', [auth, adminAuth], [
  body('username').notEmpty().withMessage('Username is required'),
  body('mobile').matches(/^\d{10}$/).withMessage('Please enter a valid 10-digit mobile number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, mobile, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec } = req.body;

    // Check if record already exists
    const existingData = await MonthlyData.findOne({ username, mobile });
    if (existingData) {
      return res.status(400).json({ message: 'Record already exists for this username and mobile number' });
    }

    const monthlyData = new MonthlyData({
      username,
      mobile,
      jan: jan || 0,
      feb: feb || 0,
      mar: mar || 0,
      apr: apr || 0,
      may: may || 0,
      jun: jun || 0,
      jul: jul || 0,
      aug: aug || 0,
      sep: sep || 0,
      oct: oct || 0,
      nov: nov || 0,
      dec: dec || 0,
      createdBy: req.user._id
    });

    await monthlyData.save();
    await monthlyData.populate('createdBy', 'username email');

    res.status(201).json({
      message: 'Monthly data created successfully',
      data: monthlyData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update monthly data (admin only)
router.put('/:id', [auth, adminAuth], [
  body('username').notEmpty().withMessage('Username is required'),
  body('mobile').matches(/^\d{10}$/).withMessage('Please enter a valid 10-digit mobile number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, mobile, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec } = req.body;

    const monthlyData = await MonthlyData.findById(req.params.id);
    if (!monthlyData) {
      return res.status(404).json({ message: 'Data not found' });
    }

    // Check if another record exists with same username and mobile
    const existingData = await MonthlyData.findOne({
      username,
      mobile,
      _id: { $ne: req.params.id }
    });

    if (existingData) {
      return res.status(400).json({ message: 'Another record already exists for this username and mobile number' });
    }

    // Update fields
    monthlyData.username = username;
    monthlyData.mobile = mobile;
    monthlyData.jan = jan !== undefined ? jan : monthlyData.jan;
    monthlyData.feb = feb !== undefined ? feb : monthlyData.feb;
    monthlyData.mar = mar !== undefined ? mar : monthlyData.mar;
    monthlyData.apr = apr !== undefined ? apr : monthlyData.apr;
    monthlyData.may = may !== undefined ? may : monthlyData.may;
    monthlyData.jun = jun !== undefined ? jun : monthlyData.jun;
    monthlyData.jul = jul !== undefined ? jul : monthlyData.jul;
    monthlyData.aug = aug !== undefined ? aug : monthlyData.aug;
    monthlyData.sep = sep !== undefined ? sep : monthlyData.sep;
    monthlyData.oct = oct !== undefined ? oct : monthlyData.oct;
    monthlyData.nov = nov !== undefined ? nov : monthlyData.nov;
    monthlyData.dec = dec !== undefined ? dec : monthlyData.dec;

    await monthlyData.save();
    await monthlyData.populate('createdBy', 'username email');

    res.json({
      message: 'Monthly data updated successfully',
      data: monthlyData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete monthly data (admin only)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const monthlyData = await MonthlyData.findById(req.params.id);
    if (!monthlyData) {
      return res.status(404).json({ message: 'Data not found' });
    }

    await MonthlyData.findByIdAndDelete(req.params.id);

    res.json({ message: 'Monthly data deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;