import os
from datetime import timedelta

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# MongoDB Configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = "street_issues"

# Roboflow API Configuration
ROBOFLOW_API_KEY = "1t0Kt9bTXNKRXzqqIbMR"
ROBOFLOW_MODEL = "street-issues/2"

# Priority Configuration
PRIORITY_WEIGHTS = {
    "detection_count": 0.4,
    "confidence": 0.3,
    "repeat_reports": 0.3
}

# Time Estimation (in days)
TIME_ESTIMATES = {
    "high": {"min": 1, "max": 2},
    "medium": {"min": 3, "max": 5},
    "low": {"min": 7, "max": 14}
}

# Rewards Points
POINTS_PER_REPORT = 10
POINTS_FOR_VERIFIED = 20

# Location proximity threshold (in meters)
LOCATION_PROXIMITY_THRESHOLD = 50
