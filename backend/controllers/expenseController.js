const Expense = require("../models/Expense");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Simple in-memory cache for AI suggestions (key: expenseData, value: suggestion)
const suggestionCache = new Map();

// Exponential backoff retry function
const withRetry = async (fn, maxRetries = 4, initialDelay = 5000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if ((error.message.includes("429") || error.message.includes("503")) && attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt - 1); // Exponential backoff: 5s, 10s, 20s, 40s
        console.warn(`Error ${error.message.includes("429") ? "429" : "503"}, retrying after ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
};

// Gemini AI integration for budget suggestions
const getAIBudgetSuggestion = async (expenses, totalBudget) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    let model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", apiVersion: "v1beta" });

    const expenseData = expenses.map((exp) => `${exp.category}: ${exp.amount} ${exp.currency}`).join(", ");
    const cacheKey = `${expenseData}:${totalBudget}`;
    
    // Check cache first
    if (suggestionCache.has(cacheKey)) {
      return suggestionCache.get(cacheKey);
    }

    const prompt = `Analyze the following spending pattern and provide budget optimization tips for a ${totalBudget} USD monthly budget. Expenses: ${expenseData}. Return 3 specific, actionable suggestions in a concise bulleted list.`;

    const result = await withRetry(() => model.generateContent(prompt));
    const suggestion = (await result.response).text();
    // Cache the suggestion
    suggestionCache.set(cacheKey, suggestion);
    if (suggestionCache.size > 100) {
      const oldestKey = suggestionCache.keys().next().value;
      suggestionCache.delete(oldestKey);
    }
    return suggestion;
  } catch (error) {
    if (error.message.includes("429") || error.message.includes("503")) {
      console.warn(`Error ${error.message.includes("429") ? "429" : "503"} in gemini-1.5-flash, retrying with gemini-1.5-pro`);
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro", apiVersion: "v1beta" });
      const expenseData = expenses.map((exp) => `${exp.category}: ${exp.amount} ${exp.currency}`).join(", ");
      const cacheKey = `${expenseData}:${totalBudget}`;
      const prompt = `Analyze the following spending pattern and provide budget optimization tips for a ${totalBudget} USD monthly budget. Expenses: ${expenseData}. Return 3 specific, actionable suggestions in a concise bulleted list.`;
      
      try {
        const result = await withRetry(() => model.generateContent(prompt));
        const suggestion = (await result.response).text();
        suggestionCache.set(cacheKey, suggestion);
        if (suggestionCache.size > 100) {
          const oldestKey = suggestionCache.keys().next().value;
          suggestionCache.delete(oldestKey);
        }
        return suggestion;
      } catch (fallbackError) {
        console.error("Fallback error with gemini-1.5-pro:", fallbackError);
        return `- Track expenses daily to identify savings opportunities.\n- Prioritize needs over wants to stay within budget.\n- Review subscriptions for potential cancellations.`;
      }
    }
    console.error("AI suggestion error:", error);
    return `- Track expenses daily to identify savings opportunities.\n- Prioritize needs over wants to stay within budget.\n- Review subscriptions for potential cancellations.`;
  }
};

// Get currency exchange rates
const getCurrencyRates = async (req, res) => {
  try {
    const { base = "USD" } = req.query;
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${base}?apiKey=${process.env.EXCHANGERATE_API_KEY}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching currency rates", error: error.message });
  }
};

// Create expense
const createExpense = async (req, res) => {
  try {
    // ...existing code...
    const { amount, category, description, currency } = req.body;

    // Input validation
    if (!amount || !category || !currency) {
      // ...existing code...
      return res.status(400).json({ message: "Amount, category, and currency are required" });
    }
    if (isNaN(amount) || amount <= 0) {
      // ...existing code...
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    const expense = new Expense({
      userId: req.userId,
      amount,
      category,
      description,
      currency: currency || "USD",
    });

    await expense.save();
    // ...existing code...

    // Get AI budget suggestion with currency conversion
    const userExpenses = await Expense.find({ userId: req.userId });
    let totalSpentUSD = 0;

    // Convert expenses to USD
    for (const exp of userExpenses) {
      if (exp.currency === "USD") {
        totalSpentUSD += exp.amount;
      } else {
        try {
          const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${exp.currency}?apiKey=${process.env.EXCHANGERATE_API_KEY}`);
          const exchangeRate = response.data.rates.USD;
          totalSpentUSD += exp.amount * exchangeRate;
          // ...existing code...
        } catch (error) {
        // ...existing code...
          // Fallback to treating amount as USD to avoid blocking
          totalSpentUSD += exp.amount;
        }
      }
    }

    const totalBudgetUSD = totalSpentUSD * 1.2; // 20% above total spent

    let suggestion = "";
    try {
      suggestion = await getAIBudgetSuggestion(userExpenses, totalBudgetUSD);
      // ...existing code...
    } catch (aiError) {
      console.error("AI suggestion error:", aiError);
      suggestion = "";
    }

    expense.budgetSuggestions = suggestion;
    await expense.save();
    // ...existing code...

    res.status(201).json({
      message: "Expense created successfully",
      expense,
      aiSuggestion: suggestion,
    });
  } catch (error) {
    // ...existing code...
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all expenses for user
const getExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate } = req.query;

    const query = { userId: req.userId };

    if (category) query.category = category;
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
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update expense
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, description, currency, date } = req.body;

    // Input validation
    if (amount && (isNaN(amount) || amount <= 0)) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    // Build update object dynamically
    const updateFields = { amount, category, description, currency };
    if (date) {
      updateFields.date = date;
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId: req.userId },
      updateFields,
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense updated successfully", expense });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findOneAndDelete({ _id: id, userId: req.userId });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get expense analytics
const getExpenseAnalytics = async (req, res) => {
  try {
    const userId = req.userId;

    // Total expenses by category
    const categoryStats = await Expense.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    // Monthly spending trend
    const monthlyStats = await Expense.aggregate([
      { $match: { userId: userId } },
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

    res.json({
      categoryStats,
      monthlyStats,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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