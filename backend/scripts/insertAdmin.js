const mongoose = require("mongoose")
const dotenv = require("dotenv")
const User = require("../models/User")

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ai-budget-tracker"

async function insertAdmin() {
  await mongoose.connect(MONGO_URI)
  const adminEmail = "admin@budget.com"
  const adminExists = await User.findOne({ email: adminEmail })
  if (adminExists) {
    console.log("Admin user already exists.")
    process.exit(0)
  }
  const admin = new User({
    name: "Admin",
    email: adminEmail,
    password: "admin123", // Change after first login
    role: "admin",
    preferredCurrency: "USD",
  })
  await admin.save()
  console.log("Admin user created:", admin.email)
  process.exit(0)
}

insertAdmin().catch((err) => {
  console.error(err)
  process.exit(1)
})
