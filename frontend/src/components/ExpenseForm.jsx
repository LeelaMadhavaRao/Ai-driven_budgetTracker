"use client"

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useExpense } from "../context/ExpenseContext";
import toast from "react-hot-toast";

const ExpenseForm = () => {
  const [formData, setFormData] = useState({
    amount: "",
    category: "food",
    description: "",
    currency: "USD",
  });
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [currencyError, setCurrencyError] = useState(null);

  const { user } = useAuth();
  const { addExpense, fetchCurrencyRates, currencyRates } = useExpense();
  const navigate = useNavigate();

  const categories = [
    "food",
    "transportation",
    "entertainment",
    "utilities",
    "healthcare",
    "shopping",
    "education",
    "Accommodation",
    "other",
  ];

  const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "INR", "CNY"];

  useEffect(() => {
    if (user?.preferredCurrency) {
      setFormData((prev) => ({ ...prev, currency: user.preferredCurrency }));
      fetchCurrencyRates(user.preferredCurrency)
        .then(() => setCurrencyError(null))
        .catch(() => setCurrencyError("Failed to load currency rates"));
    }
  }, [user, fetchCurrencyRates]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setCurrencyError(null);

    const result = await addExpense({
      amount: Number.parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      currency: formData.currency,
    });

    if (result.success) {
      toast.success("Expense added successfully!");
      setAiSuggestion(result.aiSuggestion);
      setFormData({
        amount: "",
        category: "food",
        description: "",
        currency: formData.currency,
      });
    } else {
      toast.error(result.error);
    }

    setLoading(false);
  };

  // Calculate converted amount safely
  const convertedAmount = currencyRates?.rates && formData.amount && formData.currency
    ? (Number.parseFloat(formData.amount) / (currencyRates.rates[formData.currency] || 1)).toFixed(2)
    : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Expense</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {currencyError ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-700">{currencyError}</p>
            </div>
          ) : (
            convertedAmount && formData.currency !== user?.preferredCurrency && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-700">
                  ≈ {user?.preferredCurrency} {convertedAmount} (estimated conversion)
                </p>
              </div>
            )
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional description..."
              disabled={loading}
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Adding..." : "Add Expense"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/expenses")}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {aiSuggestion && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">🤖</div>
            <div>
              <h3 className="text-lg font-semibold text-purple-800 mb-2">AI Budget Suggestions</h3>
              <div className="text-gray-700 whitespace-pre-line">{aiSuggestion}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseForm;