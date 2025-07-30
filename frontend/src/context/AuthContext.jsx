"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import { authAPI } from "../services/api"

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: true,
}

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      localStorage.setItem("token", action.payload.token)
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      }
    case "LOGOUT":
      localStorage.removeItem("token")
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      }
    case "LOAD_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      }
    case "AUTH_ERROR":
      localStorage.removeItem("token")
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    if (state.token) {
      loadUser()
    } else {
      dispatch({ type: "AUTH_ERROR" })
    }
  }, [])

  const loadUser = async () => {
    try {
      const response = await authAPI.getProfile()
      dispatch({ type: "LOAD_USER", payload: response.data.user })
    } catch (error) {
      dispatch({ type: "AUTH_ERROR" })
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password)
      dispatch({ type: "LOGIN_SUCCESS", payload: response.data })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Login failed" }
    }
  }

  const register = async (name, email, password, preferredCurrency) => {
    try {
      const response = await authAPI.register(name, email, password, preferredCurrency)
      dispatch({ type: "REGISTER_SUCCESS", payload: response.data })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Registration failed" }
    }
  }

  const logout = () => {
    dispatch({ type: "LOGOUT" })
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
