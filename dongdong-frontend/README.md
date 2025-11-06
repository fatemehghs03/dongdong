# Dong-Dong Frontend

A modern, responsive React frontend for the Dong-Dong expense splitting application. Built with TypeScript, featuring a beautiful landing page that showcases the app's capabilities and a clean, intuitive user interface.

## 🚀 Features

### Landing Page
- **Modern Design**: Clean, professional design with gradient accents and smooth animations
- **Responsive Layout**: Fully responsive design that works on all devices
- **Interactive Elements**: Hover effects, animations, and smooth scrolling
- **Feature Showcase**: Comprehensive overview of all app capabilities
- **Call-to-Action**: Clear buttons to guide users to sign up or learn more

### Technical Features
- **TypeScript**: Full type safety and better development experience
- **Modern React**: Built with React 18 and functional components
- **API Integration**: Ready-to-use API service layer with axios
- **Authentication**: JWT token handling with automatic refresh
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox
- **Accessibility**: WCAG compliant with proper semantic HTML

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: CSS3 with modern features (Grid, Flexbox, Custom Properties)
- **Icons**: Lucide React (beautiful, customizable icons)
- **HTTP Client**: Axios for API communication
- **Build Tool**: Create React App with TypeScript template
- **Code Quality**: ESLint, Prettier (via CRA)

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager
- **Dong-Dong Backend** running on `http://localhost:8000`

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd dongdong-frontend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000

# Optional: Enable/disable features
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_DEBUG=true
```

### 3. Start the Development Server

```bash
npm start
```

The app will open in your browser at `http://localhost:3000`.

### 4. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## 📁 Project Structure

```
dongdong-frontend/
├── public/
│   ├── index.html          # Main HTML template
│   └── manifest.json       # PWA manifest
├── src/
│   ├── components/         # Reusable React components
│   ├── pages/             # Page components
│   │   └── LandingPage.tsx # Main landing page
│   ├── services/          # API services and utilities
│   │   └── api.ts         # Axios configuration and API calls
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # All type definitions
│   ├── App.tsx            # Main App component
│   ├── App.css            # Global styles
│   ├── index.tsx          # React entry point
│   └── index.css          # Base styles and utilities
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md             # This file
```

## 🎨 Design Features

### Color Scheme
- **Primary**: Gradient from `#667eea` to `#764ba2`
- **Secondary**: Clean grays and whites
- **Accent**: Success green `#059669`
- **Text**: Dark gray `#1a1a1a` for readability

### Typography
- **Font**: Inter (Google Fonts) for modern, clean appearance
- **Weights**: 300, 400, 500, 600, 700
- **Responsive**: Scales appropriately on all devices

### Components
- **Buttons**: Multiple variants (primary, secondary, outline)
- **Cards**: Feature cards with hover effects
- **Navigation**: Fixed header with smooth scrolling
- **Mobile Mockup**: Interactive phone interface preview

## 🔧 Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (not recommended)

## 🌐 API Integration

The frontend is designed to work with the Dong-Dong backend API. Key features:

### Authentication
- JWT token-based authentication
- Automatic token refresh
- Secure token storage in localStorage

### API Services
- **Auth API**: Login, register, logout, token refresh
- **Groups API**: CRUD operations for groups and memberships
- **Expenses API**: Expense management and calculations
- **Health API**: Backend health monitoring

### Error Handling
- Automatic token refresh on 401 errors
- Graceful error handling with user feedback
- Network error recovery

## 📱 Responsive Design

The landing page is fully responsive with breakpoints:

- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: Below 768px
- **Small Mobile**: Below 480px

### Mobile Features
- Touch-friendly buttons and interactions
- Optimized typography and spacing
- Collapsible navigation
- Stacked layouts for better readability

## ♿ Accessibility

- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: ARIA labels and descriptions
- **Color Contrast**: WCAG AA compliant contrast ratios
- **Focus Management**: Clear focus indicators

## 🎯 Performance

- **Code Splitting**: Automatic code splitting with React.lazy
- **Image Optimization**: Optimized images and lazy loading
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching**: Proper HTTP caching headers

## 🔒 Security

- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: Axios CSRF token handling
- **Secure Headers**: Content Security Policy ready
- **Token Security**: Secure token storage and transmission

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📦 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Static Hosting

The `build` folder contains static files that can be deployed to:
- **Netlify**: Drag and drop the build folder
- **Vercel**: Connect your GitHub repository
- **AWS S3**: Upload build folder contents
- **GitHub Pages**: Use gh-pages package

### Environment Variables for Production

Make sure to set the correct API URL in your production environment:

```env
REACT_APP_API_URL=https://your-api-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   # Kill process using port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **API connection errors**
   - Ensure the backend is running on `http://localhost:8000`
   - Check the `REACT_APP_API_URL` in your `.env` file

3. **Build errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **TypeScript errors**
   - Ensure all dependencies are installed
   - Check `tsconfig.json` configuration

## 📞 Support

For support, email frontend@dongdong.com or create an issue in the repository.

---

**Dong-Dong Frontend** - Beautiful, responsive, and user-friendly! ✨
