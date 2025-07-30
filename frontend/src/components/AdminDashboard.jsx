"use client"

import { useEffect, useState } from "react"
import { adminAPI } from "../services/api"
import toast from "react-hot-toast"

const AdminDashboard = () => {
  const [spendingTrends, setSpendingTrends] = useState([])
  const [categoryAnalytics, setCategoryAnalytics] = useState([])
  const [platformStats, setPlatformStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const [trendsResponse, categoryResponse] = await Promise.all([
        adminAPI.getSpendingTrends(),
        adminAPI.getCategoryAnalytics(),
      ])

      setSpendingTrends(trendsResponse.data.spendingTrends)
      setPlatformStats(trendsResponse.data.platformStats)
      setCategoryAnalytics(categoryResponse.data.categoryAnalytics)
    } catch (error) {
      toast.error("Failed to fetch admin data")
      console.error("Admin data fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

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
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>

        {/* Platform Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Users</p>
                <p className="text-3xl font-bold">{platformStats.totalUsers || 0}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Expenses</p>
                <p className="text-3xl font-bold">{platformStats.totalExpenses || 0}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Amount</p>
                <p className="text-3xl font-bold">${(platformStats.totalAmount || 0).toFixed(2)}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
        </div>

        {/* User Spending Trends */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Spending Users</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expenses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Expense
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categories
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {spendingTrends.slice(0, 10).map((user, index) => (
                  <tr key={user._id.userId} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user._id.userName}</div>
                        <div className="text-sm text-gray-500">{user._id.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${user.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.expenseCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.avgExpense.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.categories.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Analytics */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Category Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryAnalytics.map((category, index) => (
              <div key={category._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-medium text-gray-800 capitalize">{category._id}</h4>
                  <span className="text-2xl">
                    {category._id === "food"
                      ? "🍔"
                      : category._id === "transportation"
                        ? "🚗"
                        : category._id === "entertainment"
                          ? "🎬"
                          : category._id === "utilities"
                            ? "⚡"
                            : category._id === "healthcare"
                              ? "🏥"
                              : category._id === "shopping"
                                ? "🛍️"
                                : category._id === "education"
                                  ? "📚"
                                  : "📦"}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-medium">${category.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Users:</span>
                    <span className="font-medium">{category.userCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expenses:</span>
                    <span className="font-medium">{category.expenseCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Amount:</span>
                    <span className="font-medium">${category.avgAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
