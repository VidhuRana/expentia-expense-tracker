# 💰 Expentia - Smart Expense Tracker

A modern, feature-rich expense tracking mobile application built with React Native and Supabase. Expentia helps users manage their finances with intuitive budgeting, detailed analytics, and smart insights.

## 🚀 Features

### 📱 **Core Functionality**
- **Expense Tracking**: Add and categorize expenses with detailed notes
- **Budget Management**: Set overall and category-wise budgets with date ranges
- **Real-time Analytics**: Visual charts and spending insights
- **Activity History**: Complete transaction history with date grouping
- **User Authentication**: Secure login/signup with Supabase Auth

### 💳 **Expense Management**
- **Smart Categories**: Pre-defined categories (Food & Dining, Transportation, Shopping, etc.)
- **Custom Notes**: Add detailed descriptions to each expense
- **Date Tracking**: Automatic timestamp with custom date selection
- **Amount Validation**: Proper number formatting and validation
- **Quick Add**: Floating action button for instant expense entry

### 📊 **Budget System**
- **Flexible Budgets**: Set overall or category-specific budgets
- **Date Ranges**: Configure budget periods (monthly, weekly, custom)
- **Progress Tracking**: Real-time budget usage with visual indicators
- **Smart Alerts**: Automatic notifications at 75%, 90%, and 100% usage
- **Budget Analytics**: Detailed breakdown of spending vs. budget

### 📈 **Analytics & Reports**
- **Weekly Charts**: Visual spending patterns by day
- **Category Breakdown**: Percentage and amount analysis by category
- **Total Spending**: Comprehensive expense summaries
- **Transaction History**: Complete activity log with timestamps
- **Trend Analysis**: Spending patterns and insights

### 🎨 **User Experience**
- **Dark/Light Theme**: Beautiful, modern UI with theme support
- **Smooth Animations**: Fluid transitions and loading states
- **Loading Skeletons**: Professional loading indicators
- **Responsive Design**: Optimized for all screen sizes
- **Intuitive Navigation**: Bottom tab navigation with floating action button

### 🔐 **Security & Data**
- **Supabase Backend**: Secure cloud database with real-time sync
- **Row Level Security**: User data isolation and protection
- **Authentication**: Email/password with session management
- **Data Persistence**: Automatic cloud backup and sync
- **Privacy**: User data remains private and secure

## 🛠️ Technical Stack

### **Frontend**
- **React Native**: Cross-platform mobile development
- **Expo**: Development framework and tools
- **React Navigation**: Screen navigation and routing
- **Animated API**: Smooth animations and transitions
- **Ionicons**: Beautiful icon library

### **Backend & Database**
- **Supabase**: Backend-as-a-Service platform
- **PostgreSQL**: Reliable database with advanced features
- **Row Level Security**: Data protection and user isolation
- **Real-time Subscriptions**: Live data updates
- **Storage**: Secure file and data storage

### **Key Libraries**
- **@supabase/supabase-js**: Supabase client library
- **@expo/vector-icons**: Icon library
- **react-native-safe-area-context**: Safe area handling
- **react-native-gesture-handler**: Touch interactions

## 📱 Screens & Features

### **🏠 Home Screen**
- **Welcome Header**: Personalized greeting with user name
- **Budget Overview**: Quick budget status and remaining amount
- **Budget Alerts**: Visual warnings for budget thresholds
- **Weekly Chart**: Interactive spending chart by day
- **Recent Transactions**: Latest 5 expenses with details
- **Quick Actions**: Floating add button and AI assistant

### **📊 Reports Screen**
- **Total Spending**: Comprehensive expense summary
- **Category Analysis**: Detailed breakdown by spending category
- **Progress Bars**: Visual representation of spending percentages
- **Transaction Count**: Number of expenses per category
- **Export Ready**: Data formatted for external analysis

### **📝 Activity Screen**
- **Chronological List**: All transactions sorted by date
- **Date Grouping**: Expenses grouped by "Today", "Yesterday", etc.
- **Pull to Refresh**: Swipe down to refresh data
- **Category Icons**: Visual category identification
- **Amount Display**: Clear expense amounts with formatting

### **👤 Profile Screen**
- **User Information**: Name, email, and member since date
- **Settings Menu**: Notifications, privacy, help, and about
- **Sign Out**: Secure logout functionality
- **Account Management**: User profile and preferences

### **💰 Budget Screen**
- **Budget Creation**: Add new budgets with categories and dates
- **Budget Management**: Edit, delete, and monitor existing budgets
- **Progress Tracking**: Visual progress bars and usage percentages
- **Alert System**: Smart notifications for budget thresholds
- **Budget Analytics**: Detailed spending vs. budget analysis

## 🔧 Database Schema

### **Tables**
- **`profiles`**: User profile information
- **`expenses`**: Expense records with categories and amounts
- **`budgets`**: Budget configurations with categories and date ranges

### **Key Functions**
- **`get_budget_usage`**: Calculate budget usage and remaining amounts
- **`check_budget_alerts`**: Identify budgets requiring alerts
- **Row Level Security**: Ensure users only access their own data

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v14 or higher)
- Expo CLI
- Supabase account
- React Native development environment

### **Installation**
```bash
# Clone the repository
git clone https://github.com/yourusername/expentia.git
cd expentia

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase URL and API key

# Start the development server
npm start
```

### **Environment Variables**
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📋 Features in Detail

### **Expense Tracking**
- ✅ Add expenses with amount, category, and notes
- ✅ Automatic timestamp and date selection
- ✅ Category-based organization
- ✅ Amount validation and formatting
- ✅ Real-time data sync

### **Budget Management**
- ✅ Overall and category-specific budgets
- ✅ Custom date ranges for budget periods
- ✅ Visual progress indicators
- ✅ Smart alert system (75%, 90%, 100%)
- ✅ Budget usage analytics

### **Analytics & Insights**
- ✅ Weekly spending charts
- ✅ Category breakdown analysis
- ✅ Total spending summaries
- ✅ Transaction history tracking
- ✅ Spending pattern insights

### **User Experience**
- ✅ Modern, intuitive interface
- ✅ Smooth animations and transitions
- ✅ Loading skeletons for better UX
- ✅ Responsive design
- ✅ Theme support (dark/light)

### **Security & Data**
- ✅ Secure authentication
- ✅ Row-level security
- ✅ Real-time data sync
- ✅ Cloud backup
- ✅ Privacy protection

## 🎯 Use Cases

### **Personal Finance**
- Track daily expenses and spending habits
- Set and monitor monthly budgets
- Analyze spending patterns by category
- Get alerts when approaching budget limits

### **Financial Planning**
- Create category-specific budgets
- Monitor long-term spending trends
- Identify areas for cost reduction
- Plan future expenses based on history

### **Business Expenses**
- Track business-related spending
- Categorize expenses for tax purposes
- Monitor budget adherence
- Generate expense reports

## 🔮 Future Enhancements

### **Planned Features**
- 📊 Advanced analytics and insights
- 💳 Credit card integration
- 📱 Push notifications for budget alerts
- 🔄 Automatic expense categorization
- 📤 Export functionality (PDF, CSV)
- 🌐 Multi-currency support
- 👥 Shared budgets and expenses
- 🤖 AI-powered spending insights

### **Technical Improvements**
- 🚀 Performance optimizations
- 📱 Native platform features
- 🔒 Enhanced security measures
- 🌐 Offline functionality
- 📊 Advanced data visualization

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues, feature requests, or pull requests.

### **Development Guidelines**
- Follow React Native best practices
- Maintain consistent code style
- Add proper error handling
- Include comprehensive tests
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the excellent backend platform
- **Expo** for the amazing development framework
- **React Native** community for the robust ecosystem
- **Ionicons** for the beautiful icon library

---

**Expentia** - Making personal finance management simple, intuitive, and powerful! 💰✨ 