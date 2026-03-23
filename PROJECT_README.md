# 🚧 Street Issue Detection App

AI-powered street issue reporting system that detects potholes and road damage using computer vision.

## 🎯 Features

- 📸 Image capture/upload from mobile or desktop
- 🤖 AI-powered detection using Roboflow API
- 📍 GPS location tracking
- 🗺️ Interactive maps with Leaflet
- 📊 Priority calculation (High/Medium/Low)
- 💾 MongoDB database storage
- 📱 Mobile-friendly responsive design

## 🏗️ Tech Stack

### Backend
- Python 3.13
- FastAPI
- MongoDB (Motor async driver)
- Roboflow API

### Frontend
- React 18
- Vite
- React Router
- Tailwind CSS
- Leaflet Maps
- Axios

## 🚀 Quick Start

### Backend Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Make sure MongoDB is running (localhost:27017)

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

- `POST /report` - Submit new report with image and GPS
- `GET /reports` - Get all reports
- `GET /reports/{id}` - Get single report details

## 🗺️ Project Structure

```
.
├── main.py              # FastAPI app setup
├── routes.py            # API endpoints
├── utils.py             # Helper functions
├── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/      # React pages
│   │   ├── components/ # React components
│   │   └── App.jsx     # Main app component
│   └── package.json    # Node dependencies
└── README.md
```

## 🔑 Environment Variables

Backend uses default MongoDB connection: `mongodb://localhost:27017`

To customize, set:
```bash
export MONGODB_URL="your_mongodb_connection_string"
```

## 📝 License

MIT

## 👨‍💻 Author

Built with ❤️ for safer streets
