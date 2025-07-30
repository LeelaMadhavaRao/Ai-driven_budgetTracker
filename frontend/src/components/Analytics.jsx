"use client"

import { useEffect, useState } from "react"
import { useExpense } from "../context/ExpenseContext"
import { useAuth } from "../context/AuthContext"

const Analytics = () => {
  const { analytics, fetchAnalytics, expenses, fetchExpenses, budget, fetchBudget } = useExpense()
  const { user, token } = useAuth()
  const [timeRange, setTimeRange] = useState("all")

  useEffect(() => {
    fetchAnalytics()
    fetchExpenses()
    const now = new Date()
    if (token) {
      fetchBudget(now.getMonth(), now.getFullYear(), token)
    }
  }, [token])

  const getFilteredExpenses = () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    switch (timeRange) {
      case "month":
        return expenses.filter((exp) => new Date(exp.date) >= startOfMonth)
      case "year":
        return expenses.filter((exp) => new Date(exp.date) >= startOfYear)
      case "30days":
        return expenses.filter((exp) => new Date(exp.date) >= thirtyDaysAgo)
      default:
        return expenses
    }
  }

  const filteredExpenses = getFilteredExpenses()
  const totalSpent = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  // Category breakdown
  const categoryBreakdown = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {})

  const categoryData = Object.entries(categoryBreakdown)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  // Monthly trend
  const monthlyTrend = filteredExpenses.reduce((acc, expense) => {
    const date = new Date(expense.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    acc[monthKey] = (acc[monthKey] || 0) + expense.amount
    return acc
  }, {})

  const monthlyData = Object.entries(monthlyTrend)
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6) // Last 6 months

  const getCategoryColor = (index) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-gray-500",
    ]
    return colors[index % colors.length]
  }

  // Budget comparison
  const now = new Date()
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const currentMonthSpent = monthlyTrend[currentMonthKey] || 0
  const budgetAmount = budget?.amount || 0
  const overBudget = currentMonthSpent > budgetAmount && budgetAmount > 0

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Expense Analytics</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            <option value="all">All Time</option>
            <option value="year">This Year</option>
            <option value="month">This Month</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>

        {/* Summary Stats */}
        <div className="mb-4">
          {budgetAmount > 0 && (
            <div className={`p-4 rounded-lg ${overBudget ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className="text-gray-700 font-medium">Monthly Budget</span>
                <span className="font-bold text-lg">{user?.preferredCurrency || "USD"} {budgetAmount.toFixed(2)}</span>
              </div>
              <div className="mt-2 text-sm">
                {overBudget ? (
                  <span className="text-red-600 font-semibold">You are <b>over</b> your budget by {user?.preferredCurrency || "USD"} {(currentMonthSpent - budgetAmount).toFixed(2)} this month.</span>
                ) : (
                  <span className="text-green-600 font-semibold">You are <b>within</b> your budget. Remaining: {user?.preferredCurrency || "USD"} {(budgetAmount - currentMonthSpent).toFixed(2)}</span>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col items-center justify-center">
            <p className="text-blue-600 text-sm font-medium">Total Spent</p>
            <p className="text-2xl font-bold text-blue-800">
              {user?.preferredCurrency || "USD"} {totalSpent.toFixed(2)}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center justify-center">
            <p className="text-green-600 text-sm font-medium">Transactions</p>
            <p className="text-2xl font-bold text-green-800">{filteredExpenses.length}</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex flex-col items-center justify-center">
            <p className="text-purple-600 text-sm font-medium">Avg per Transaction</p>
            <p className="text-2xl font-bold text-purple-800">
              {user?.preferredCurrency || "USD"}{" "}
              {filteredExpenses.length > 0 ? (totalSpent / filteredExpenses.length).toFixed(2) : "0.00"}
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex flex-col items-center justify-center">
            <p className="text-orange-600 text-sm font-medium">Categories</p>
            <p className="text-2xl font-bold text-orange-800">{categoryData.length}</p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h3>
          {categoryData.length > 0 ? (
            <div className="space-y-4">
              {categoryData.map((item, index) => (
                <div key={item.category} className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 gap-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">{item.category}</span>
                      <span className="text-sm text-gray-600">
                        {user?.preferredCurrency || "USD"} {item.amount.toFixed(2)} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getCategoryColor(index)}`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available for the selected time range.</p>
          )}
        </div>

        {/* Monthly Expense Worm Graph */}
        {monthlyData.length > 1 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Expense Worm Graph</h3>
            <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
              <MonthlyWormGraph data={monthlyData} budgetAmount={budgetAmount} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics

// Worm graph component
const MonthlyWormGraph = ({ data, budgetAmount }) => {
  // Responsive SVG dimensions
  // Use viewBox for scaling, and set width/height to 100% for parent container
  const baseWidth = 900; // Large base width for desktop
  const baseHeight = 300; // Large base height for desktop
  const padding = 50;
  const maxAmount = Math.max(...data.map(d => d.amount), budgetAmount);
  const points = data.map((d, i) => {
    const x = padding + (i * (baseWidth - 2 * padding)) / (data.length - 1);
    const y = baseHeight - padding - ((d.amount / maxAmount) * (baseHeight - 2 * padding));
    return [x, y];
  });
  // Create smooth curve path
  const path = points.reduce((acc, point, i, arr) => {
    const [x, y] = point;
    if (i === 0) return `M${x},${y}`;
    const [prevX, prevY] = arr[i - 1];
    const midX = (prevX + x) / 2;
    return acc + ` Q${midX},${prevY} ${x},${y}`;
  }, "");
  // Budget line
  const budgetY = baseHeight - padding - ((budgetAmount / maxAmount) * (baseHeight - 2 * padding));
  return (
    <div className="w-full" style={{ minHeight: 220 }}>
      <svg
        viewBox={`0 0 ${baseWidth} ${baseHeight}`}
        width="100%"
        height="100%"
        className="w-full h-64 sm:h-72 md:h-80 lg:h-96"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Budget line */}
        {budgetAmount > 0 && (
          <line x1={padding} y1={budgetY} x2={baseWidth - padding} y2={budgetY} stroke="#f59e42" strokeDasharray="6 4" strokeWidth={3} />
        )}
        {/* Worm path */}
        <path d={path} fill="none" stroke="#2563eb" strokeWidth={5} />
        {/* Points */}
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={10} fill="#2563eb" />
        ))}
        {/* Month labels */}
        {data.map((d, i) => (
          <text
            key={d.month}
            x={points[i][0]}
            y={baseHeight - padding + 30}
            textAnchor="middle"
            fontSize="32"
            fill="#555"
            style={{ fontWeight: 500 }}
          >
            {new Date(d.month + "-01").toLocaleDateString("en-US", { month: "short" })}
          </text>
        ))}
      </svg>
    </div>
  );
};
