# AI-Driven Budget Tracker

A comprehensive budget tracking application with AI-powered insights, multi-currency support, and real-time analytics.

## Features

### 🤖 AI-Powered Insights
- **Gemini AI Integration**: Get personalized budget optimization suggestions
- **Smart Recommendations**: AI analyzes spending patterns and provides actionable tips
- **Budget Optimization**: Intelligent suggestions for better financial management

### 💰 Multi-Currency Support
- **Real-time Exchange Rates**: Powered by ExchangeRate-API
- **Currency Conversion**: Automatic conversion between different currencies
- **Global Support**: Track expenses in multiple currencies

### 📊 Advanced Analytics
- **Category Breakdown**: Visual representation of spending by category
- **Monthly Trends**: Track spending patterns over time
- **Interactive Charts**: Responsive charts with smooth animations
- **Spending Insights**: Detailed analytics and reporting

### 🔐 Secure Authentication
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: User and admin roles with different permissions
- **Protected Routes**: Secure access to sensitive features

### 👨‍💼 Admin Dashboard
- **User Management**: View all users and their spending patterns
- **Platform Analytics**: Overall platform statistics and insights
- **Category Analytics**: Cross-user category spending analysis
- **Spending Trends**: Monitor user spending behaviors

## Tech Stack

### Backend
- **Node.js & Express**: RESTful API server
- **MongoDB & Mongoose**: Database and ODM
- **JWT**: Authentication and authorization
- **bcryptjs**: Password hashing
- **Gemini AI**: AI-powered budget suggestions
- **ExchangeRate-API**: Real-time currency conversion

### Frontend
- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Context API**: State management
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **React Hot Toast**: Beautiful notifications

## Project Structure

\`\`\`
ai-budget-tracker/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── expenseController.js
│   │   └── adminController.js
│   ├── models/
│   │   ├── User.js
│   │   └── Expense.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── expenseRoutes.js
│   │   └── adminRoutes.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── db.js
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.jsx
    │   │   ├── ExpenseForm.jsx
    │   │   ├── ExpenseList.jsx
    │   │   ├── Analytics.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   └── ...
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ExpenseContext.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── package.json
\`\`\`

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Gemini AI API key
- Git

### Backend Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd ai-budget-tracker/backend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Configuration**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Update the \`.env\` file with your configuration:
   \`\`\`env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/budget-tracker
   JWT_SECRET=your-super-secret-jwt-key
   GEMINI_API_KEY=your-gemini-api-key
   \`\`\`

4. **Start the server**
   \`\`\`bash
   npm run dev
   \`\`\`

### Frontend Setup

1. **Navigate to frontend directory**
   \`\`\`bash
   cd ../frontend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- \`POST /api/auth/register\` - User registration
- \`POST /api/auth/login\` - User login
- \`GET /api/auth/profile\` - Get user profile

### Expenses
- \`GET /api/expenses\` - Get user expenses
- \`POST /api/expenses\` - Create new expense
- \`PUT /api/expenses/:id\` - Update expense
- \`DELETE /api/expenses/:id\` - Delete expense
- \`GET /api/expenses/analytics\` - Get expense analytics
- \`GET /api/expenses/currency-rates\` - Get currency exchange rates

### Admin (Admin only)
- \`GET /api/admin/spending-trends\` - Get user spending trends
- \`GET /api/admin/category-analytics\` - Get category analytics

## Features in Detail

### 🎯 Expense Management
- **Add Expenses**: Easy form to add expenses with category selection
- **Edit/Delete**: Full CRUD operations on expenses
- **Multi-currency**: Support for 8+ major currencies
- **Categorization**: 8 predefined categories for better organization

### 📈 Analytics & Insights
- **Visual Charts**: Category breakdown with percentage distribution
- **Time-based Filtering**: View expenses by month, year, or custom range
- **Spending Trends**: Monthly spending visualization
- **Summary Statistics**: Total spent, average per transaction, etc.

### 🤖 AI Integration
- **Smart Suggestions**: AI analyzes spending and provides optimization tips
- **Budget Recommendations**: Personalized advice based on spending patterns
- **Real-time Insights**: Get suggestions immediately after adding expenses

### 🔒 Security Features
- **Password Hashing**: bcrypt for secure password storage
- **JWT Tokens**: Secure authentication with expiring tokens
- **Input Validation**: Comprehensive validation on all inputs
- **Error Handling**: Graceful error handling throughout the application

## Deployment

### Backend Deployment
1. **Environment Variables**: Set all required environment variables
2. **Database**: Ensure MongoDB is accessible
3. **Build**: No build step required for Node.js
4. **Start**: Use \`npm start\` for production

### Frontend Deployment
1. **Build the application**
   \`\`\`bash
   npm run build
   \`\`\`
2. **Deploy**: Upload the \`dist\` folder to your hosting service
3. **Environment**: Update API endpoints for production

### Recommended Platforms
- **Backend**: Railway, Heroku, DigitalOcean
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Database**: MongoDB Atlas, Railway

## Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email your-email@example.com or create an issue in the repository.

## Acknowledgments

- **Gemini AI** for providing intelligent budget suggestions
- **ExchangeRate-API** for real-time currency conversion
- **Tailwind CSS** for the beautiful UI components
- **React Community** for the amazing ecosystem

---

**Happy Budget Tracking! 💰📊**
