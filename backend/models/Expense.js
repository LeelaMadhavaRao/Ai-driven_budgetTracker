const mongoose = require("mongoose")

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "food",
        "transportation",
        "accommodation",
        "electricity",
        "education",
        "groceries",
        "healthcare",
        "shopping",
        "entertainment",
        "other"
      ],
    },
    description: {
      type: String,
      trim: true,
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
    },
    budgetSuggestions: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Expense", expenseSchema)
