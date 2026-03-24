from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    street: str
    city: str
    state: str
    latitude: float
    longitude: float
    phone: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    street: str
    city: str
    state: str
    latitude: float
    longitude: float
    phone: Optional[str] = None
    points: int = 0
    reports_count: int = 0
    is_admin: bool = False
    created_at: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Location(BaseModel):
    latitude: float
    longitude: float

class Detection(BaseModel):
    type: str
    confidence: float
    bbox: dict

class ReportCreate(BaseModel):
    category: str
    latitude: float
    longitude: float

class ReportUpdate(BaseModel):
    status: str
    admin_notes: Optional[str] = None

class Report(BaseModel):
    id: str
    user_id: str
    username: str
    category: str
    timestamp: str
    location: Location
    detections: List[Detection]
    issue_count: int
    priority: str
    status: str
    estimated_days: dict
    is_repeat: bool
    repeat_count: int
    points_awarded: int
    image_url: Optional[str] = None

class LeaderboardEntry(BaseModel):
    username: str
    points: int
    reports_count: int
    rank: int

class DashboardStats(BaseModel):
    total_reports: int
    pending: int
    in_progress: int
    resolved: int
    user_reports: int
    user_points: int
