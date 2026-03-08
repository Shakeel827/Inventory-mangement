# 📦 Inventory Management System

> Professional inventory management system with QR code scanning, real-time tracking, bulk operations, and powerful reporting.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Firebase](https://img.shields.io/badge/Firebase-11.0.0-orange.svg)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.0-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- 📱 **QR Code Scanning** - Scan QR codes with mobile devices for instant check-in/check-out
- 👥 **Role-Based Access Control** - Admin, Manager, and Scanner roles with granular permissions
- 📊 **Advanced Reporting** - Generate detailed Excel reports on device usage and inventory
- 📤 **Bulk Import/Export** - Import hundreds of devices via Excel with progress tracking
- 🔔 **Real-Time Updates** - Firebase real-time synchronization across all devices
- 🎨 **Custom Fields** - Define custom fields for your specific inventory needs
- 📈 **Dashboard Analytics** - Visual insights into your inventory status
- 🔒 **Secure Authentication** - Firebase Authentication with email/password and Google sign-in
- 📱 **Mobile Responsive** - Works perfectly on desktop, tablet, and mobile devices
- 🌙 **Dark Mode UI** - Beautiful dark theme optimized for extended use

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Shakeel827/Inventory-mangement.git
cd Inventory-mangement
```

2. **Install dependencies**
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies (optional)
cd ../backend
npm install
```

3. **Configure Firebase**
- Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
- Enable Authentication (Email/Password and Google)
- Create a Firestore database
- Copy your Firebase config to `frontend/src/firebaseClient.ts`

4. **Run the development server**
```bash
cd frontend
npm run dev
```

5. **Open your browser**
```
http://localhost:5173
```

## 📖 Documentation

### Project Structure

```
Inventory-mangement/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   ├── layout/      # Layout components
│   │   │   └── ErrorBoundary.tsx
│   │   ├── pages/           # Page components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── DevicesPage.tsx
│   │   │   ├── CategoriesPage.tsx
│   │   │   ├── ReportsPage.tsx
│   │   │   └── ...
│   │   ├── context/         # React context providers
│   │   ├── utils/           # Utility functions
│   │   ├── constants.ts     # Application constants
│   │   ├── types.ts         # TypeScript type definitions
│   │   ├── firebaseClient.ts # Firebase configuration
│   │   └── App.tsx          # Main application component
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Express backend (optional)
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   └── index.ts         # Server entry point
│   └── package.json
├── firebase/                # Firebase configuration
│   ├── firestore.rules      # Firestore security rules
│   └── firestore.indexes.json
├── firebase.json            # Firebase hosting config
└── README.md
```

### User Roles

#### Admin
- Full access to all features
- Manage users and assign roles
- Configure custom fields
- Access all reports
- Manage categories and devices

#### Manager
- Manage devices and categories
- Generate reports
- View audit logs
- Cannot manage users

#### Scanner (User)
- Scan QR codes
- Check-in/check-out devices
- View dashboard
- Limited access to other features

### Key Features Explained

#### QR Code Scanning
1. Navigate to QR Scanner page
2. Allow camera access
3. Scan device QR code
4. Instantly check-in or check-out

#### Bulk Import
1. Download Excel template from Devices page
2. Fill in device information
3. Upload Excel file
4. Watch real-time progress (0-100%)
5. Review import summary

#### Custom Fields
1. Go to Devices page
2. Click "Manage Fields"
3. Add custom fields (text, number, date)
4. Fields appear in manual add form
5. Fields included in Excel template

#### Reports
- **Device Usage Report** - All check-in/check-out activity
- **User Activity Report** - Activity by user
- **Inventory Snapshot** - Current inventory status
- **Dashboard Report** - Summary with statistics

## 🔧 Configuration

### Environment Variables

Create `.env` file in backend directory:

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE_MB=10
```

### Firebase Configuration

Update `frontend/src/firebaseClient.ts` with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

## 🚀 Deployment

### Deploy to Firebase Hosting

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**
```bash
firebase login
```

3. **Build the frontend**
```bash
cd frontend
npm run build
```

4. **Deploy**
```bash
cd ..
firebase deploy
```

Your app will be live at: `https://YOUR-PROJECT-ID.web.app`

### Deploy with Cloudflare Tunnel (Local Testing)

```bash
# Run the automated script
./start-tunnel.ps1

# Or manually
cd frontend
npm run dev

# In another terminal
./cloudflared tunnel --url http://localhost:5173
```

## 🧪 Testing

```bash
# Run tests
cd frontend
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript 5.6** - Type safety
- **Vite 6.0** - Build tool
- **Tailwind CSS 3.4** - Styling
- **Framer Motion 11.0** - Animations
- **React Router 6.28** - Routing
- **React Hot Toast** - Notifications
- **React Helmet Async** - SEO
- **Firebase 11.0** - Backend services
- **XLSX** - Excel import/export
- **jsPDF** - PDF generation
- **html5-qrcode** - QR scanning
- **qrcode.react** - QR generation

### Backend (Optional)
- **Express** - Web framework
- **Firebase Admin SDK** - Server-side Firebase
- **Express Rate Limit** - API rate limiting
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Compression** - Response compression

### Database
- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - User authentication
- **Firebase Hosting** - Static hosting

## 🔒 Security

- ✅ CORS restricted to specific origins
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ Strong password requirements (8+ chars, uppercase, lowercase, number)
- ✅ File upload validation (size, type, extension)
- ✅ Firestore security rules with role-based access
- ✅ Input sanitization and validation
- ✅ Error boundaries for graceful error handling
- ✅ HTTPS encryption (Firebase Hosting)

## 📈 Performance

- ✅ Code splitting with React.lazy()
- ✅ Optimized bundle size
- ✅ Real-time updates with Firebase
- ✅ Efficient Firestore queries
- ✅ Batch operations for bulk imports
- ✅ Optimistic UI updates
- ✅ Image optimization
- ✅ Compression enabled

## 🌐 SEO

- ✅ React Helmet for meta tags
- ✅ Semantic HTML structure
- ✅ Open Graph tags for social sharing
- ✅ Twitter Card tags
- ✅ Canonical URLs
- ✅ Sitemap generation
- ✅ Robots.txt
- ✅ Fast page load times

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Shakeel Ahmad**
- GitHub: [@Shakeel827](https://github.com/Shakeel827)
- Project: [Inventory Management](https://github.com/Shakeel827/Inventory-mangement)

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- All open-source contributors

## 📞 Support

For support, email support@inventoryq.com or open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Barcode scanning support
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Export to PDF reports
- [ ] Integration with external systems
- [ ] Automated backup system
- [ ] Advanced search and filters

## 📸 Screenshots

### Landing Page
Beautiful, modern landing page with feature highlights

### Dashboard
Real-time inventory overview with statistics

### Device Management
Comprehensive device management with bulk operations

### QR Scanner
Mobile-friendly QR code scanner for quick check-in/out

### Reports
Detailed Excel reports with customizable data

---

**Made with ❤️ by Shakeel**

⭐ Star this repo if you find it helpful!
