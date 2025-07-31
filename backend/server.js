const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const connectDB = require("./db")

// Import routes
const authRoutes = require("./routes/authRoutes")
const expenseRoutes = require("./routes/expenseRoutes")
const adminRoutes = require("./routes/adminRoutes")
const budgetRoutes = require("./routes/budgetRoutes")

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://ai-driven-budget-trackerbackend.vercel.app",
    "https://ai-driven-budget-tracker.vercel.app"
  ],
  credentials: true
}))
app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/expenses", expenseRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/budget", budgetRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Budget Tracker API is running!" })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
