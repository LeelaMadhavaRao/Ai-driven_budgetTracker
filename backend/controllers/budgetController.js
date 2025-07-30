const Budget = require('../models/Budget');

exports.setBudget = async (req, res) => {
  try {
    const { month, year, amount } = req.body;
    const userId = req.user._id;
    let budget = await Budget.findOne({ user: userId, month, year });
    if (budget) {
      budget.amount = amount;
      await budget.save();
    } else {
      budget = await Budget.create({ user: userId, month, year, amount });
    }
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBudget = async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user._id;
    const budget = await Budget.findOne({ user: userId, month, year });
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
