"use client"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

import React, { useState } from "react"
// ...existing imports...

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold">
            💰 Budget Tracker
          </Link>
          {/* Mobile menu button */}
          <button
            className="md:hidden flex items-center px-2 py-1 border rounded text-white border-blue-300 hover:bg-blue-700 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-200 transition-colors">Dashboard</Link>
                <Link to="/add-expense" className="hover:text-blue-200 transition-colors">Add Expense</Link>
                <Link to="/expenses" className="hover:text-blue-200 transition-colors">Expenses</Link>
                <Link to="/analytics" className="hover:text-blue-200 transition-colors">Analytics</Link>
                {user?.role === "admin" && (
                  <Link to="/admin" className="hover:text-blue-200 transition-colors">Admin</Link>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Hello, {user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200 transition-colors">Login</Link>
                <Link to="/register" className="hover:text-blue-200 transition-colors">Register</Link>
              </>
            )}
          </div>
        </div>
        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-blue-700 rounded-lg shadow-lg py-4 px-4 mt-2 flex flex-col space-y-3 animate-fade-in">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-200 transition-colors">Dashboard</Link>
                <Link to="/add-expense" className="hover:text-blue-200 transition-colors">Add Expense</Link>
                <Link to="/expenses" className="hover:text-blue-200 transition-colors">Expenses</Link>
                <Link to="/analytics" className="hover:text-blue-200 transition-colors">Analytics</Link>
                {user?.role === "admin" && (
                  <Link to="/admin" className="hover:text-blue-200 transition-colors">Admin</Link>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Hello, {user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-blue-800 hover:bg-blue-900 px-3 py-1 rounded text-sm transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200 transition-colors">Login</Link>
                <Link to="/register" className="hover:text-blue-200 transition-colors">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
