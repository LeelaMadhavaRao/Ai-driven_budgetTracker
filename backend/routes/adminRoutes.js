const express = require("express")
const { getUserSpendingTrends, getCategoryAnalytics } = require("../controllers/adminController")
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware")

const router = express.Router()

// All routes require authentication and admin role
router.use(authMiddleware)
router.use(adminMiddleware)

router.get("/spending-trends", getUserSpendingTrends)
router.get("/category-analytics", getCategoryAnalytics)

module.exports = router
