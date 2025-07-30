import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const HomeCover = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Animation variants for hero and feature cards
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut", staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const features = [
    {
      title: "Smart Budgeting",
      desc: "Set and manage budgets, compare spending, and stay on track with ease.",
      color: "blue",
    },
    {
      title: "Expense Tracking",
      desc: "Effortlessly add, edit, and categorize your expenses in real-time.",
      color: "green",
    },
    {
      title: "AI Insights",
      desc: "Receive personalized, AI-driven suggestions to optimize your spending.",
      color: "purple",
    },
    {
      title: "Analytics & Visuals",
      desc: "Explore detailed analytics and interactive charts for better insights.",
      color: "yellow",
    },
    {
      title: "Secure & Private",
      desc: "Your data is protected with robust authentication and privacy controls.",
      color: "pink",
    },
    {
      title: "Multi-Device Ready",
      desc: "Access your budget anywhere with a fully responsive design.",
      color: "indigo",
    },
  ];

  return (
    <motion.div
      className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-white to-green-100 px-4 py-12 sm:py-16"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="max-w-4xl w-full bg-white/95 rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col items-center text-center border border-gray-100/20 backdrop-blur-md"
        variants={itemVariants}
      >
        {/* <motion.img
          src="/logo.svg"
          alt="AI Budget Tracker Logo"
          className="w-20 h-20 sm:w-24 sm:h-24 mb-6 drop-shadow-lg"
          variants={itemVariants}
          whileHover={{ scale: 1.1, rotate: 5 }}
          onError={(e) => (e.target.src = "/placeholder-logo.svg")} // Fallback for missing logo
        /> */}
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-900 mb-4 tracking-tight"
          variants={itemVariants}
        >
          AI Budget Tracker
        </motion.h1>
        <motion.p
          className="text-base sm:text-lg md:text-xl text-gray-700 mb-10 max-w-2xl font-light leading-relaxed"
          variants={itemVariants}
        >
          Take control of your finances with AI-powered insights. Track expenses, set budgets, and optimize spending effortlessly.
        </motion.p>
        <motion.div className="w-full mb-12" variants={itemVariants}>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-green-800 mb-6">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`relative bg-${feature.color}-50 border-l-4 border-${feature.color}-600 rounded-xl p-4 sm:p-5 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden`}
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -2 }}
                role="listitem"
              >
                <div
                  className={`absolute inset-0 bg-${feature.color}-100/20 opacity-0 hover:opacity-100 transition-opacity duration-300`}
                />
                <span className={`font-semibold text-${feature.color}-800`}>{feature.title}</span>
                <p className="text-gray-600 text-sm sm:text-base mt-1">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full justify-center"
          variants={itemVariants}
        >
          {user ? null : (
            <button
              className="w-full sm:w-auto px-8 py-3 bg-blue-700 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 text-base sm:text-lg"
              aria-label="Get Started"
              onClick={() => navigate("/login")}
            >
              Get Started
            </button>
          )}
        </motion.div>
      </motion.div>
      <motion.footer
        className="mt-10 text-gray-600 text-sm text-center font-medium"
        variants={itemVariants}
      >
        &copy; {new Date().getFullYear()} AI Budget Tracker. All rights reserved.
      </motion.footer>
    </motion.div>
  );
};

export default HomeCover;