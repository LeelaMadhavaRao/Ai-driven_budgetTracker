import axios from "axios"

const API_BASE_URL = "http://localhost:5000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (name, email, password, preferredCurrency) =>
    api.post("/auth/register", { name, email, password, preferredCurrency }),
  getProfile: () => api.get("/auth/profile"),
}

// Expense API
export const expenseAPI = {
  getExpenses: (filters) => api.get("/expenses", { params: filters }),
  createExpense: (data) => api.post("/expenses", data),
  updateExpense: (id, data) => api.put(`/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  getAnalytics: () => api.get("/expenses/analytics"),
  getCurrencyRates: (base) => api.get("/expenses/currency-rates", { params: { base } }),
}

// Admin API
export const adminAPI = {
  getSpendingTrends: () => api.get("/admin/spending-trends"),
  getCategoryAnalytics: () => api.get("/admin/category-analytics"),
}

export default api
