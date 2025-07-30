const express = require("express")
const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getCurrencyRates,
  getExpenseAnalytics,
} = require("../controllers/expenseController")
const { authMiddleware } = require("../middlewares/authMiddleware")

const router = express.Router()

// All routes require authentication
router.use(authMiddleware)

router.post("/", createExpense)
router.get("/", getExpenses)
router.put("/:id", updateExpense)
router.delete("/:id", deleteExpense)
router.get("/analytics", getExpenseAnalytics)
router.get("/currency-rates", getCurrencyRates)

module.exports = router
