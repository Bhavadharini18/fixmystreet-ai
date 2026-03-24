from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import motor.motor_asyncio
from config import MONGODB_URL, DATABASE_NAME

app = FastAPI(title="FixMyStreetAI API", version="2.0")

# CORS middleware - Must be before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

# Collections
users_collection = db.users
reports_collection = db.reports

@app.get("/")
async def root():
    return {
        "app": "FixMyStreetAI",
        "version": "2.0",
        "message": "AI-Powered Street Issue Reporting with Social Features",
        "features": [
            "Authentication with Location",
            "AI Detection",
            "Smart Priority",
            "Social Interactions (Likes & Comments)",
            "Street-based Feed",
            "Rewards System",
            "Admin Panel"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Backend is running"}

@app.get("/test-cors")
async def test_cors():
    return {"message": "CORS is working if you can see this"}

# Import routes AFTER app initialization
from auth_routes import router as auth_router
from report_routes import router as report_router
from admin_routes import router as admin_router
from social_routes import router as social_router

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])

app.include_router(report_router, prefix="", tags=["Reports"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])
app.include_router(social_router, prefix="/social", tags=["Social"])
