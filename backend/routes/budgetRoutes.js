const express = require('express');
const router = express.Router();
const { setBudget, getBudget } = require('../controllers/budgetController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/set', authMiddleware, setBudget);
router.get('/', authMiddleware, getBudget);

module.exports = router;
