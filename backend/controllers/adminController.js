const User = require("../models/User")
const Expense = require("../models/Expense")

// Get all users spending trends (Admin only)
const getUserSpendingTrends = async (req, res) => {
  try {
    const spendingTrends = await Expense.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $group: {
          _id: {
            userId: "$userId",
            userName: "$user.name",
            userEmail: "$user.email",
          },
          totalSpent: { $sum: "$amount" },
          expenseCount: { $sum: 1 },
          avgExpense: { $avg: "$amount" },
          categories: { $addToSet: "$category" },
        },
      },
      { $sort: { totalSpent: -1 } },
    ])

    // Overall platform statistics
    const totalUsers = await User.countDocuments()
    const totalExpenses = await Expense.countDocuments()
    const totalAmount = await Expense.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }])

    res.json({
      spendingTrends,
      platformStats: {
        totalUsers,
        totalExpenses,
        totalAmount: totalAmount[0]?.total || 0,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get category-wise spending across all users
const getCategoryAnalytics = async (req, res) => {
  try {
    const categoryAnalytics = await Expense.aggregate([
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          userCount: { $addToSet: "$userId" },
          avgAmount: { $avg: "$amount" },
          expenseCount: { $sum: 1 },
        },
      },
      {
        $project: {
          category: "$_id",
          totalAmount: 1,
          userCount: { $size: "$userCount" },
          avgAmount: 1,
          expenseCount: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ])

    res.json({ categoryAnalytics })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

module.exports = {
  getUserSpendingTrends,
  getCategoryAnalytics,
}
