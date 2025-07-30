"use client"

import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useExpense } from "../context/ExpenseContext"
import { useEffect, useState } from "react"

const Dashboard = () => {
  const { user, token } = useAuth()
  const { expenses, analytics, budget, fetchExpenses, fetchAnalytics, fetchBudget, setBudget } = useExpense()
  const [recentExpenses, setRecentExpenses] = useState([])
  const [budgetAmount, setBudgetAmount] = useState("")
  const [aiSuggestion, setAiSuggestion] = useState("")
  const [editingBudget, setEditingBudget] = useState(false)
  // AI Insights modal state
  const [showAiModal, setShowAiModal] = useState(false)

  useEffect(() => {
    fetchExpenses({ limit: 5 })
    fetchAnalytics()
    const now = new Date()
    fetchBudget(now.getMonth(), now.getFullYear(), token)
  }, [])

  useEffect(() => {
    setRecentExpenses(expenses.slice(0, 5))
  }, [expenses])

  useEffect(() => {
    if (budget) setBudgetAmount(budget.amount)
  }, [budget])

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const now = new Date()
  const thisMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
  })
  const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  // AI suggestion logic
  useEffect(() => {
    if (budget && budget.amount > 0) {
      if (thisMonthTotal > budget.amount) {
        setAiSuggestion("You have exceeded your monthly budget. Consider reviewing your expenses and setting limits for discretionary spending.")
      } else if (thisMonthTotal > budget.amount * 0.8) {
        setAiSuggestion("You are close to reaching your monthly budget. Try to minimize non-essential expenses for the rest of the month.")
      } else {
        setAiSuggestion("You are managing your budget well this month. Keep up the good work!")
      }
    } else {
      setAiSuggestion("")
    }
  }, [budget, thisMonthTotal])

  const handleBudgetSubmit = async (e) => {
    e.preventDefault()
    setEditingBudget(false)
    await setBudget(now.getMonth(), now.getFullYear(), Number(budgetAmount), token)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {user?.name}! 👋</h1>
        <p className="text-gray-600">Here's your financial overview for today.</p>
      </div>

      {/* Budget Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-gray-800">Monthly Budget</h2>
          {!editingBudget && (
            <button
              className="text-blue-600 hover:text-blue-800 text-sm"
              onClick={() => setEditingBudget(true)}
            >
              {budget ? "Edit" : "Set"} Budget
            </button>
          )}
        </div>
        {editingBudget ? (
          <form className="flex items-center space-x-2" onSubmit={handleBudgetSubmit}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={budgetAmount}
              onChange={e => setBudgetAmount(e.target.value)}
              className="border rounded px-2 py-1 w-32"
              placeholder="Enter amount"
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Save</button>
            <button type="button" className="text-gray-500 px-2" onClick={() => setEditingBudget(false)}>Cancel</button>
          </form>
        ) : (
          <div className="text-lg text-gray-700">
            {budget ? `${user?.preferredCurrency || "USD"} ${budget.amount}` : "No budget set for this month."}
          </div>
        )}
        {aiSuggestion && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded text-orange-700">
            <div className="text-2xl mb-1">🤖 AI Suggestion</div>
            <div>{aiSuggestion}</div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Spent</p>
              <p className="text-2xl font-bold">
                {user?.preferredCurrency || "USD"} {totalSpent.toFixed(2)}
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">This Month</p>
              <p className="text-2xl font-bold">
                {user?.preferredCurrency || "USD"} {thisMonthTotal.toFixed(2)}
              </p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Expenses</p>
              <p className="text-2xl font-bold">{expenses.length}</p>
            </div>
            <div className="text-3xl">📝</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/add-expense"
            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-center transition-colors"
          >
            <div className="text-2xl mb-2">➕</div>
            <p className="text-blue-700 font-medium">Add Expense</p>
          </Link>

          <Link
            to="/expenses"
            className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-center transition-colors"
          >
            <div className="text-2xl mb-2">📋</div>
            <p className="text-green-700 font-medium">View Expenses</p>
          </Link>

          <Link
            to="/analytics"
            className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 text-center transition-colors"
          >
            <div className="text-2xl mb-2">📈</div>
            <p className="text-purple-700 font-medium">Analytics</p>
          </Link>

          <button
            className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center w-full focus:outline-none"
            onClick={() => setShowAiModal(true)}
          >
            <div className="text-2xl mb-2">🤖</div>
            <p className="text-orange-700 font-medium">AI Insights</p>
          </button>
  
      {/* AI Insights Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
              onClick={() => setShowAiModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-2">🤖</span>
              <h3 className="text-xl font-bold text-gray-800">AI Insights</h3>
            </div>
            <div className="space-y-3">
              {/* Main AI suggestion */}
              <div className="p-3 bg-orange-50 border border-orange-200 rounded text-orange-700">
                <strong>Summary:</strong> {aiSuggestion || "No AI suggestion available for this month."}
              </div>
              {/* Additional insights */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-700">
                <strong>Budget:</strong> {budget ? `${user?.preferredCurrency || "USD"} ${budget.amount}` : "No budget set."}
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700">
                <strong>This Month's Spending:</strong> {user?.preferredCurrency || "USD"} {thisMonthTotal.toFixed(2)}
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded text-purple-700">
                <strong>Expenses:</strong> {expenses.length} total, {thisMonthExpenses.length} this month
              </div>
              {/* Custom tip based on spending pattern */}
              {budget && thisMonthTotal > budget.amount ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
                  <strong>Tip:</strong> Try reviewing your highest spending categories and set limits for next month.
                </div>
              ) : budget && thisMonthTotal > budget.amount * 0.8 ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
                  <strong>Tip:</strong> You're close to your budget. Consider pausing non-essential purchases.
                </div>
              ) : budget ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700">
                  <strong>Tip:</strong> Great job! You're managing your budget well.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Expenses</h2>
          <Link to="/expenses" className="text-blue-600 hover:text-blue-800 text-sm">
            View All →
          </Link>
        </div>

        {recentExpenses.length > 0 ? (
          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <div key={expense._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">{expense.category.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 capitalize">{expense.category}</p>
                    <p className="text-sm text-gray-600">{expense.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">
                    {expense.currency} {expense.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">{new Date(expense.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p>No expenses yet. Start tracking your spending!</p>
            <Link
              to="/add-expense"
              className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Your First Expense
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
