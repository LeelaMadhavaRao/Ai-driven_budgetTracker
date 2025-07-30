"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useExpense } from "../context/ExpenseContext"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

// Categories array accessible to all components in this file
const categories = [
  "food",
  "transportation",
  "accomodation",
  "electricity",
  "education",
  "groceries",
  "healthcare",
  "shopping",
  "Entertainment",
  "other",
]

const ExpenseList = () => {
  const { expenses, fetchExpenses, deleteExpense, loading } = useExpense()
  const { user } = useAuth()
  const [filters, setFilters] = useState({
    category: "",
    startDate: "",
    endDate: "",
  })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const handleFilterChange = (e) => {
    const newFilters = {
      ...filters,
      [e.target.name]: e.target.value,
    }
    setFilters(newFilters)
    fetchExpenses(newFilters)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      const result = await deleteExpense(id)
      if (result.success) {
        toast.success("Expense deleted successfully")
      } else {
        toast.error(result.error)
      }
    }
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Your Expenses</h2>
          <Link
            to="/add-expense"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Expense
          </Link>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-blue-700 font-medium">Total: {expenses.length} expenses</span>
            <span className="text-blue-700 font-bold text-lg">
              {user?.preferredCurrency || "USD"} {totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Expense List */}
        {expenses.length > 0 ? (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div
                key={expense._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">{expense.category.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 capitalize">{expense.category}</h3>
                        <p className="text-sm text-gray-600">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {expense.description && <p className="text-gray-600 mb-2">{expense.description}</p>}

                    {expense.budgetSuggestions && (
                      <div className="bg-purple-50 border border-purple-200 rounded-md p-3 mt-3">
                        <p className="text-sm text-purple-700">
                          <span className="font-medium">AI Suggestion:</span> {expense.budgetSuggestions}
                        </p>
                      </div>
                    )}
                    {/* Inline Edit Form */}
                    {editingId === expense._id ? (
                      <ExpenseEditForm
                        expense={expense}
                        onCancel={() => setEditingId(null)}
                        onSave={() => setEditingId(null)}
                      />
                    ) : null}
                  </div>

                  <div className="text-right ml-4">
                    <p className="text-xl font-bold text-gray-800">
                      {expense.currency} {expense.amount.toFixed(2)}
                    </p>
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => setEditingId(expense._id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-medium mb-2">No expenses found</h3>
            <p className="mb-4">Start tracking your expenses to see them here.</p>
            <Link
              to="/add-expense"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Your First Expense
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExpenseList

// Inline edit form component
function ExpenseEditForm({ expense, onCancel, onSave }) {
  const { updateExpense } = useExpense()
  const [form, setForm] = useState({
    category: expense.category,
    amount: expense.amount,
    description: expense.description,
    date: expense.date.slice(0, 10),
    currency: expense.currency,
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await updateExpense(expense._id, form)
    setLoading(false)
    if (result.success) {
      toast.success("Expense updated successfully")
      onSave()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form className="mt-4 space-y-2" onSubmit={handleSubmit}>
      <div className="flex space-x-2">
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border rounded px-2 py-1"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
        <input
          type="number"
          name="amount"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-24"
          placeholder="Amount"
          required
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="border rounded px-2 py-1"
          required
        />
        <input
          type="text"
          name="currency"
          value={form.currency}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-16"
          placeholder="Currency"
          required
        />
      </div>
      <input
        type="text"
        name="description"
        value={form.description}
        onChange={handleChange}
        className="border rounded px-2 py-1 w-full"
        placeholder="Description"
      />
      <div className="flex space-x-2">
        <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
        <button type="button" className="text-gray-500 px-2" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
