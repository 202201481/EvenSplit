# EvenSplit Frontend

A minimalistic React frontend for the EvenSplit expense sharing application - a clone of Splitwise with dark theme design.

## 🚀 Features

- **🔐 Authentication**: Secure login and registration system
- **📊 Dashboard**: Comprehensive overview of balances and recent activities  
- **💰 Bills**: Create and manage bills with multiple split types (equal, percentage, custom amounts)
- **👥 Friends**: Search, add and manage friends
- **👨‍👩‍👧‍👦 Groups**: Create groups for easier bill management
- **💸 Settlements**: Record and track payments between friends
- **📈 Analytics**: View spending insights, patterns and smart recommendations
- **⚙️ Profile**: User profile management and app settings
- **📱 Responsive**: Mobile-first design with responsive navigation
- **🔔 Notifications**: Real-time feedback with toast notifications
- **🌙 Dark Theme**: Beautiful dark color scheme throughout

## 🛠️ Technology Stack

- **Frontend Framework**: React 19
- **Styling**: Tailwind CSS with custom dark theme
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios for API communication
- **State Management**: React Context API
- **Authentication**: Token-based authentication
- **Icons & Emojis**: Emoji-based icons for minimalistic design

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.js       # Main layout wrapper with navigation
│   ├── Navbar.js       # Responsive navigation bar
│   ├── PrivateRoute.js # Protected route wrapper
│   ├── LoadingSpinner.js # Loading indicator component
│   └── ErrorMessage.js # Error display component
├── contexts/           # React contexts for state management
│   ├── AuthContext.js  # Authentication state and methods
│   └── NotificationContext.js # Toast notification system
├── pages/              # Main page components
│   ├── Login.js        # User login page
│   ├── Register.js     # User registration page
│   ├── Dashboard.js    # Main dashboard with overview
│   ├── Bills.js        # Bills management and creation
│   ├── Friends.js      # Friends management
│   ├── Groups.js       # Groups management
│   ├── Settlements.js  # Payment settlements tracking
│   ├── Analytics.js    # Spending analytics and insights
│   ├── Profile.js      # User profile and settings
│   └── NotFound.js     # 404 error page
├── services/           # API services and configuration
│   └── api.js          # Axios configuration and API endpoints
├── utils/              # Utility functions
│   └── validation.js   # Form validation helpers
├── App.js              # Main application component with routing
└── index.js            # Application entry point
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue tones (#0ea5e9, #0284c7, etc.) for main actions
- **Dark Background**: Slate shades (#0f172a to #64748b) for dark theme
- **Success**: Green (#10b981) for positive amounts and success states
- **Error**: Red (#ef4444) for negative amounts and errors
- **Warning**: Yellow (#f59e0b) for warnings and highlights

### Typography
- **Font**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', etc.)
- **Sizes**: Tailwind's responsive typography scale
- **Weight**: Regular (400) for body text, Medium (500) for labels, Bold (700) for headings

## 🔧 Setup and Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EvenSplit/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   - The frontend is configured to connect to Django backend at `http://localhost:8000/api`
   - Update `src/services/api.js` if your backend runs on a different port

4. **Start development server**
   ```bash
   npm start
   ```

5. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000) in your browser
   - Make sure your Django backend is running on port 8000

## 📱 Usage Guide

### Getting Started
1. **Register**: Create a new account with username, email, and password
2. **Login**: Sign in with your credentials
3. **Add Friends**: Search for users by username or email to add as friends
4. **Create Groups**: Organize friends into groups (e.g., "Roommates", "Trip to Europe")

### Managing Expenses
1. **Create Bills**: Add expenses with description, amount, and category
2. **Choose Split Type**:
   - **Equal**: Split amount equally among participants
   - **Percentage**: Specify percentage for each person
   - **Custom Amount**: Set specific amount for each participant
3. **Add to Groups**: Assign bills to specific groups for better organization

### Tracking & Settlements
1. **View Dashboard**: See balance overview and recent activities
2. **Check Balances**: Monitor who owes what with color-coded indicators
3. **Record Payments**: Log settlements between friends
4. **View Analytics**: Analyze spending patterns by category and time

## 🔌 API Integration

The frontend integrates with the following Django REST API endpoints:

### Authentication
- `POST /api/register/` - User registration
- `POST /api/login/` - User authentication (returns token)

### User Management
- `GET /api/search/?search={query}` - Search users by username/email

### Core Features
- `GET|POST /api/friends/` - Friends management
- `GET|POST /api/bills/` - Bills management with split calculations
- `GET|POST /api/groups/` - Groups management
- `GET|POST /api/settlements/` - Settlement tracking

### Analytics
- `GET /api/balances/` - Calculate balance between users
- `GET /api/analytics/` - Spending analytics by category and month
- `GET /api/insights/` - AI-powered spending insights

## 🔐 Authentication Flow

1. User logs in with credentials
2. Backend returns authentication token
3. Token stored in localStorage
4. Token included in all subsequent API requests via Axios interceptor
5. User data cached in AuthContext for app-wide access

## 📱 Responsive Design

- **Mobile First**: Designed for mobile devices with touch-friendly interfaces
- **Breakpoints**: Tailwind's responsive breakpoints (sm, md, lg, xl)
- **Navigation**: Collapsible mobile menu with hamburger icon
- **Forms**: Touch-optimized form controls and inputs
- **Cards**: Responsive grid layouts that adapt to screen size

## 🚧 Future Enhancements

- **Real-time Updates**: WebSocket integration for live updates
- **Push Notifications**: Browser notifications for new bills and settlements
- **Currency Support**: Multi-currency support with exchange rates
- **Receipt Upload**: Image upload and OCR for automatic bill creation
- **Split Optimization**: Smart suggestions for optimal settlement paths
- **Data Export**: Export transaction history to CSV/PDF
- **Recurring Bills**: Automated recurring expense management
- **Social Features**: Activity feed and social interactions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for hassle-free expense sharing**

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
