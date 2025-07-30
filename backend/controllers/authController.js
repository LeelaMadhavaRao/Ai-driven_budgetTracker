const User = require("../models/User")
const jwt = require("jsonwebtoken")

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "9133603383", {
    expiresIn: "7d",
  })
}

const register = async (req, res) => {
  try {
    const { name, email, password, preferredCurrency } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      preferredCurrency: preferredCurrency || "USD",
    })

    await user.save()

    const token = generateToken(user._id)

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferredCurrency: user.preferredCurrency,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const token = generateToken(user._id)

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferredCurrency: user.preferredCurrency,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password")
    res.json({ user })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

module.exports = {
  register,
  login,
  getProfile,
}
