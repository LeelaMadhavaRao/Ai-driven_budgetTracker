"use client"

import { createContext, useContext, useReducer } from "react"
import { expenseAPI } from "../services/api"

const ExpenseContext = createContext()

const initialState = {
  expenses: [],
  analytics: null,
  currencyRates: {},
  budget: null,
  loading: false,
  error: null,
}

const expenseReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }
    case "SET_EXPENSES":
      return { ...state, expenses: action.payload, loading: false }
    case "ADD_EXPENSE":
      return { ...state, expenses: [action.payload, ...state.expenses] }
    case "UPDATE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.map((exp) => (exp._id === action.payload._id ? action.payload : exp)),
      }
    case "DELETE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.filter((exp) => exp._id !== action.payload),
      }
    case "SET_ANALYTICS":
      return { ...state, analytics: action.payload }
    case "SET_CURRENCY_RATES":
      return { ...state, currencyRates: action.payload }
    case "SET_BUDGET":
      return { ...state, budget: action.payload }
    default:
      return state
  }
}

export const ExpenseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState)

  const fetchExpenses = async (filters = {}) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const response = await expenseAPI.getExpenses(filters)
      dispatch({ type: "SET_EXPENSES", payload: response.data.expenses })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.response?.data?.message || "Failed to fetch expenses" })
    }
  }

  const addExpense = async (expenseData) => {
    try {
      const response = await expenseAPI.createExpense(expenseData)
      dispatch({ type: "ADD_EXPENSE", payload: response.data.expense })
      return { success: true, aiSuggestion: response.data.aiSuggestion }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to add expense" }
    }
  }

  const updateExpense = async (id, expenseData) => {
    try {
      const response = await expenseAPI.updateExpense(id, expenseData)
      dispatch({ type: "UPDATE_EXPENSE", payload: response.data.expense })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to update expense" }
    }
  }

  const deleteExpense = async (id) => {
    try {
      await expenseAPI.deleteExpense(id)
      dispatch({ type: "DELETE_EXPENSE", payload: id })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to delete expense" }
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await expenseAPI.getAnalytics()
      dispatch({ type: "SET_ANALYTICS", payload: response.data })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.response?.data?.message || "Failed to fetch analytics" })
    }
  }

  // Budget actions
  const fetchBudget = async (month, year, token) => {
    try {
      const { budgetAPI } = await import('../services/api')
      const budget = await budgetAPI.getBudget(month, year, token)
      dispatch({ type: "SET_BUDGET", payload: budget })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.response?.data?.message || "Failed to fetch budget" })
    }
  }

  const setBudget = async (month, year, amount, token) => {
    try {
      const { budgetAPI } = await import('../services/api')
      const budget = await budgetAPI.setBudget(month, year, amount, token)
      dispatch({ type: "SET_BUDGET", payload: budget })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to set budget" }
    }
  }

  const fetchCurrencyRates = async (baseCurrency = "USD") => {
    try {
      const response = await expenseAPI.getCurrencyRates(baseCurrency)
      dispatch({ type: "SET_CURRENCY_RATES", payload: response.data.rates })
    } catch (error) {
      console.error("Failed to fetch currency rates:", error)
    }
  }

  return (
    <ExpenseContext.Provider
      value={{
        ...state,
        fetchExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        fetchAnalytics,
        fetchCurrencyRates,
        fetchBudget,
        setBudget,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  )
}

export const useExpense = () => {
  const context = useContext(ExpenseContext)
  if (!context) {
    throw new Error("useExpense must be used within an ExpenseProvider")
  }
  return context
}
