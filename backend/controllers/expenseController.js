require("dotenv").config();
const Expense = require("../models/Expense");
const axios = require("axios");
const Bottleneck = require("bottleneck");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Google Gemini AI
const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// In-memory caches
const suggestionCache = new Map(); // AI suggestions
const exchangeRateCache = new Map(); // Exchange rates (expires after 24 hours)
const limiter = new Bottleneck({ minTime: 4000 }); // 15 RPM = 1 request every 4 seconds

// Clear cache on startup to avoid stale entries
suggestionCache.clear();

// Valid categories and currencies
const VALID_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "INR", "CNY"];
const VALID_CATEGORIES = [
        "food",
        "transportation",
        "accommodation",
        "electricity",
        "education",
        "groceries",
        "healthcare",
        "shopping",
        "entertainment",
        "other"
  ];

// Get cached exchange rate or fetch new one
const getExchangeRate = async (currency) => {
  if (!VALID_CURRENCIES.includes(currency)) {
    throw new Error(`Invalid currency code: ${currency}`);
  }
  if (exchangeRateCache.has(currency)) {
    return exchangeRateCache.get(currency);
  }
  try {
    const response = await limiter.schedule(() =>
      axios.get(`https://api.exchangerate-api.com/v4/latest/${currency}?apiKey=${process.env.EXCHANGERATE_API_KEY}`)
    );
    const rate = response.data.rates.USD;
    exchangeRateCache.set(currency, rate);
    setTimeout(() => exchangeRateCache.delete(currency), 24 * 60 * 60 * 1000); // Expire after 24 hours
    return rate;
  } catch (error) {
    console.error(`Error fetching exchange rate for ${currency}:`, {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(`Failed to fetch exchange rate for ${currency}`);
  }
};

// Gemini AI integration for budget suggestions
const getAIBudgetSuggestion = async (expenses, totalBudget, userId) => {
  try {
    const cacheKey = `${userId}:${JSON.stringify(
      expenses.map((exp) => ({ category: exp.category, amount: exp.amount, currency: exp.currency }))
    )}`;
    if (suggestionCache.has(cacheKey)) {
      return suggestionCache.get(cacheKey);
    }

    // Summarize expenses by category in USD
    const expenseSummary = {};
    for (const exp of expenses) {
      const amountUSD = exp.currency === "USD" ? exp.amount : exp.amount * (await getExchangeRate(exp.currency));
      expenseSummary[exp.category] = (expenseSummary[exp.category] || 0) + amountUSD;
    }
    const expenseData = Object.entries(expenseSummary)
      .map(([cat, amt]) => `${cat}: ${amt.toFixed(2)} USD`)
      .sort()
      .join(", ");
    const roundedBudget = Math.round(totalBudget / 100) * 100;

    const prompt = `Analyze the following spending pattern and provide budget optimization tips for a ${roundedBudget} USD monthly budget. Expenses: ${expenseData}. Return 3 specific, actionable suggestions in a concise bulleted list.`;

    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    const response = await model.generateContent(prompt);
    const suggestion = response.response.text();

    suggestionCache.set(cacheKey, suggestion);
    setTimeout(() => suggestionCache.delete(cacheKey), 60 * 60 * 1000); // Expire after 1 hour
    return suggestion;
  } catch (error) {
    console.error("AI suggestion error:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error("Failed to generate AI budget suggestion");
  }
};

// Get currency exchange rates
const getCurrencyRates = async (req, res) => {
  try {
    const { base = "USD" } = req.query;
    if (!VALID_CURRENCIES.includes(base)) {
      return res.status(400).json({ error: { message: "Invalid base currency" } });
    }
    const response = await limiter.schedule(() =>
      axios.get(`https://api.exchangerate-api.com/v4/latest/${base}?apiKey=${process.env.EXCHANGERATE_API_KEY}`)
    );
    res.json(response.data);
  } catch (error) {
    console.error("Currency rates error:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    res.status(500).json({ error: { message: "Error fetching currency rates", details: error.message } });
  }
};

// Create expense
const createExpense = async (req, res) => {
  try {
    const { amount, category, description, currency = "USD" } = req.body;

    // Input validation
    if (!amount || !category || !currency) {
      return res.status(400).json({ error: { message: "Amount, category, and currency are required" } });
    }
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: { message: "Amount must be a positive number" } });
    }
    if (!VALID_CURRENCIES.includes(currency)) {
      return res.status(400).json({ error: { message: "Invalid currency code" } });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: { message: "Invalid category" } });
    }

    const expense = new Expense({
      userId: req.userId,
      amount,
      category,
      description,
      currency,
    });

    await expense.save();

    // Get all user expenses and calculate totals
    const userExpenses = await Expense.find({ userId: req.userId });
    let totalSpentUSD = 0;
    const categoryTotals = {};

    // Convert expenses to USD and compute category totals
    for (const exp of userExpenses) {
      const amountUSD = exp.currency === "USD" ? exp.amount : exp.amount * (await getExchangeRate(exp.currency));
      totalSpentUSD += amountUSD;
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + amountUSD;
    }

    // Validate budget
    const totalBudgetUSD = Math.min(totalSpentUSD * 1.2, 10000); // Cap at $10,000

    let suggestion = "";
    try {
      suggestion = await getAIBudgetSuggestion(userExpenses, totalBudgetUSD, req.userId);
    } catch (aiError) {
      console.error("AI suggestion error in createExpense:", {
        message: aiError.message,
        code: aiError.code,
        stack: aiError.stack,
      });
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const fallbackSuggestion = await Expense.findOne({
        userId: req.userId,
        budgetSuggestions: { $ne: "" },
        createdAt: { $lt: oneHourAgo },
      })
        .sort({ createdAt: -1 })
        .select("budgetSuggestions");
      suggestion = fallbackSuggestion?.budgetSuggestions || "Unable to generate AI suggestions at this time. Please try again later.";
    }

    // Validate suggestion contains current categories
    const categories = Object.keys(categoryTotals);
    if (suggestion && !categories.every((cat) => suggestion.includes(cat))) {
      suggestion = "-Unable to generate AI suggestions at this time. Please try again later.";
    }

    expense.budgetSuggestions = suggestion;
    await expense.save();

    // Format categoryTotals for response
    const formattedCategoryTotals = {};
    for (const [cat, total] of Object.entries(categoryTotals)) {
      formattedCategoryTotals[cat] = Number(total.toFixed(2));
    }

    res.status(201).json({
      message: "Expense created successfully",
      expense,
      aiSuggestion: suggestion,
      categoryTotals: formattedCategoryTotals,
    });
  } catch (error) {
    console.error("Create expense error:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    res.status(500).json({ error: { message: "Server error", details: error.message } });
  }
};

// Get all expenses for user
const getExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate } = req.query;

    const query = { userId: req.userId };

    if (category) {
      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: { message: "Invalid category" } });
      }
      query.category = category;
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Expense.countDocuments(query);

    res.json({
      expenses,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    console.error("Get expenses error:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    res.status(500).json({ error: { message: "Server error", details: error.message } });
  }
};

// Update expense
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, description, currency, date } = req.body;

    // Input validation
    if (amount && (isNaN(amount) || amount <= 0)) {
      return res.status(400).json({ error: { message: "Amount must be a positive number" } });
    }
    if (currency && !VALID_CURRENCIES.includes(currency)) {
      return res.status(400).json({ error: { message: "Invalid currency code" } });
    }
    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: { message: "Invalid category" } });
    }
    if (date && isNaN(new Date(date).getTime())) {
      return res.status(400).json({ error: { message: "Invalid date format" } });
    }

    // Build update object dynamically
    const updateFields = {};
    if (amount) updateFields.amount = amount;
    if (category) updateFields.category = category;
    if (description) updateFields.description = description;
    if (currency) updateFields.currency = currency;
    if (date) updateFields.date = new Date(date);

    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId: req.userId },
      updateFields,
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ error: { message: "Expense not found" } });
    }

    res.json({ message: "Expense updated successfully", expense });
  } catch (error) {
    console.error("Update expense error:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    res.status(500).json({ error: { message: "Server error", details: error.message } });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findOneAndDelete({ _id: id, userId: req.userId });

    if (!expense) {
      return res.status(404).json({ error: { message: "Expense not found" } });
    }

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete expense error:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    res.status(500).json({ error: { message: "Server error", details: error.message } });
  }
};

// Get expense analytics
const getExpenseAnalytics = async (req, res) => {
  try {
    const userId = req.userId;

    // Aggregate expenses by category and month
    const userExpenses = await Expense.find({ userId });
    const categoryStats = {};
    for (const exp of userExpenses) {
      const amountUSD = exp.currency === "USD" ? exp.amount : exp.amount * (await getExchangeRate(exp.currency));
      categoryStats[exp.category] = (categoryStats[exp.category] || 0) + amountUSD;
    }
    const formattedCategoryStats = Object.entries(categoryStats).map(([category, total]) => ({
      category,
      total: Number(total.toFixed(2)),
      count: userExpenses.filter((exp) => exp.category === category).length,
    }));

    // Monthly spending trend in USD
    const monthlyStats = await Expense.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    // Convert monthly totals to USD
    for (const month of monthlyStats) {
      const expensesInMonth = await Expense.find({
        userId,
        $and: [
          { date: { $gte: new Date(month._id.year, month._id.month - 1) } },
          { date: { $lt: new Date(month._id.year, month._id.month) } },
        ],
      });
      month.total = 0;
      for (const exp of expensesInMonth) {
        month.total += exp.currency === "USD" ? exp.amount : exp.amount * (await getExchangeRate(exp.currency));
      }
      month.total = Number(month.total.toFixed(2));
    }

    res.json({
      categoryStats: formattedCategoryStats,
      monthlyStats,
    });
  } catch (error) {
    console.error("Analytics error:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    res.status(500).json({ error: { message: "Server error", details: error.message } });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getCurrencyRates,
  getExpenseAnalytics,
};