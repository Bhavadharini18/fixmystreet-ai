# 🚧 Street Issue Detection App - Full Stack AI System

Comprehensive AI-powered street issue reporting system with authentication, rewards, admin panel, and smart priority detection.

## 🎯 Features

### Core Features
- 🔐 **JWT Authentication** - Secure login/signup system
- 📸 **Image Capture** - Direct camera access on mobile & desktop
- 🤖 **AI Detection** - Roboflow API integration for pothole detection
- 📍 **GPS Tracking** - Automatic location capture
- 🗺️ **Interactive Maps** - Leaflet integration with all reports
- 📊 **Smart Priority System** - Multi-factor priority calculation
- 🔄 **Repeat Detection** - Identifies duplicate reports at same location
- ⏱️ **Time Estimation** - Estimated fix time based on priority
- 🏆 **Rewards System** - Points and leaderboard
- 👨‍💼 **Admin Panel** - Full dashboard with analytics
- 📱 **Mobile Responsive** - Works seamlessly on all devices

### Smart Features
- **Priority Calculation**: Based on detection count, confidence, and repeat reports
- **Location Proximity**: Detects reports within 50m radius
- **Status Tracking**: Pending → In Progress → Resolved
- **User Points**: Earn points for reporting (10 pts normal, 20 pts verified)
- **Analytics Dashboard**: Most affected areas, status breakdown
- **Report History**: View related reports at same location

## 🏗️ Tech Stack

### Backend
- **Python 3.13** with FastAPI
- **MongoDB** with Motor (async driver)
- **JWT** authentication (python-jose)
- **Bcrypt** password hashing
- **Roboflow API** for AI detection

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Leaflet** for maps
- **Axios** for API calls

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- MongoDB running on localhost:27017

### Backend Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables (optional):
```bash
export SECRET_KEY="your-secret-key"
export MONGODB_URL="mongodb://localhost:27017"
```

3. Start the backend:
```bash
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend runs at `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user info
- `GET /auth/leaderboard` - Get top users by points

### Reports
- `POST /report` - Submit new report (requires auth)
- `GET /reports` - Get all reports (with filters)
- `GET /reports/{id}` - Get single report with related reports
- `GET /reports/user/me` - Get current user's reports
- `GET /map/reports` - Get all reports for map display

### Admin (requires admin role)
- `GET /admin/dashboard` - Get dashboard statistics
- `PUT /admin/reports/{id}` - Update report status
- `GET /admin/reports/priority/{priority}` - Get reports by priority
- `GET /admin/users` - Get all users
- `DELETE /admin/reports/{id}` - Delete report

## 🗺️ Project Structure

```
.
├── main.py                 # FastAPI app setup
├── config.py              # Configuration settings
├── models.py              # Pydantic models
├── auth.py                # Authentication logic
├── auth_routes.py         # Auth endpoints
├── report_routes.py       # Report endpoints
├── admin_routes.py        # Admin endpoints
├── utils.py               # Helper functions
├── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/        # React pages
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Report.jsx
│   │   │   ├── Result.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── ReportDetails.jsx
│   │   │   ├── MapView.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── components/   # React components
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AdminRoute.jsx
│   │   ├── utils/        # Utility functions
│   │   │   └── api.js
│   │   └── App.jsx       # Main app component
│   └── package.json      # Node dependencies
└── README.md
```

## 🔑 Configuration

### Priority Weights (config.py)
```python
PRIORITY_WEIGHTS = {
    "detection_count": 0.4,
    "confidence": 0.3,
    "repeat_reports": 0.3
}
```

### Time Estimates
- **High Priority**: 1-2 days
- **Medium Priority**: 3-5 days
- **Low Priority**: 7-14 days

### Rewards
- Normal report: 10 points
- Verified (new location): 20 points

### Location Proximity
- Reports within 50 meters are considered duplicates

## 👨‍💼 Admin Features

### Dashboard Statistics
- Total reports count
- Status breakdown (pending/in progress/resolved)
- High priority count
- Total users
- Most affected areas (top 5 locations)

### Report Management
- Update status (pending → in progress → resolved)
- Add admin notes
- Delete reports
- Filter by priority

### User Management
- View all users
- See points and report counts
- Sorted by points (leaderboard)

## 🏆 Rewards System

Users earn points for reporting issues:
- **10 points** for each report
- **20 points** for verified new location reports
- View leaderboard to see top contributors
- Track your rank and total points

## 📱 Mobile Features

- Camera access for direct photo capture
- GPS location automatic detection
- Touch-friendly interface
- Responsive design for all screen sizes

## 🔒 Security

- JWT token-based authentication
- Bcrypt password hashing
- Protected routes (user & admin)
- CORS enabled for frontend

## 📝 Default Admin Account

To create an admin user, manually update MongoDB:
```javascript
db.users.updateOne(
  { username: "admin" },
  { $set: { is_admin: true } }
)
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check connection string in config.py

### Camera Access Denied
- Enable camera permissions in browser
- Use HTTPS in production

### API Errors
- Check backend logs
- Verify Roboflow API key is valid
- Ensure all dependencies are installed

## 📄 License

MIT

## 👨‍💻 Author

Built with ❤️ for safer streets
