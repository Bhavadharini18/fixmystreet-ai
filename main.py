from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
import motor.motor_asyncio
import requests
import base64
import os

app = FastAPI(title="Street Issue Detection API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
db = client.street_issues
reports_collection = db.reports

# Roboflow API configuration
ROBOFLOW_API_KEY = "1t0Kt9bTXNKRXzqqIbMR"
ROBOFLOW_MODEL = "street-issues/2"

class Location(BaseModel):
    latitude: float
    longitude: float

class ReportResponse(BaseModel):
    id: str
    timestamp: str
    location: Location
    detections: List[dict]
    issue_count: int
    priority: str
    image_path: Optional[str] = None

from routes import router

app.include_router(router)

@app.get("/")
async def root():
    return {"message": "Street Issue Detection API"}
