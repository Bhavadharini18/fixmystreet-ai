from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId
from models import UserCreate, UserLogin, Token, User
from auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter()

# Import collections here to avoid circular import
def get_users_collection():
    from main import users_collection
    return users_collection

def get_reports_collection():
    from main import reports_collection
    return reports_collection
    return reports_collection

@router.post("/signup", response_model=Token)
async def signup(user: UserCreate):
    users_collection = get_users_collection()
    
    # Check if user exists
    existing_user = await users_collection.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    existing_email = await users_collection.find_one({"email": user.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user_dict = {
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "street": user.street,
        "city": user.city,
        "state": user.state,
        "latitude": user.latitude,
        "longitude": user.longitude,
        "phone": user.phone if user.phone else None,
        "hashed_password": get_password_hash(user.password),
        "points": 0,
        "reports_count": 0,
        "is_admin": False,
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = await users_collection.insert_one(user_dict)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.username, "user_id": str(result.inserted_id)}
    )
    
    # Return token with user info
    user_response = User(
        id=str(result.inserted_id),
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        street=user.street,
        city=user.city,
        state=user.state,
        latitude=user.latitude,
        longitude=user.longitude,
        phone=user.phone,
        points=0,
        reports_count=0,
        is_admin=False,
        created_at=user_dict["created_at"]
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": user_response}

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    users_collection = get_users_collection()
    
    db_user = await users_collection.find_one({"username": user.username})
    
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={
            "sub": user.username,
            "user_id": str(db_user["_id"]),
            "is_admin": db_user.get("is_admin", False)
        }
    )
    
    # Return token with user info
    user_response = User(
        id=str(db_user["_id"]),
        username=db_user["username"],
        email=db_user["email"],
        full_name=db_user.get("full_name", ""),
        street=db_user.get("street", ""),
        city=db_user.get("city", ""),
        state=db_user.get("state", ""),
        latitude=db_user.get("latitude", 0.0),
        longitude=db_user.get("longitude", 0.0),
        phone=db_user.get("phone"),
        points=db_user.get("points", 0),
        reports_count=db_user.get("reports_count", 0),
        is_admin=db_user.get("is_admin", False),
        created_at=db_user["created_at"]
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": user_response}

@router.get("/me", response_model=User)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    users_collection = get_users_collection()
    
    user = await users_collection.find_one({"username": current_user["sub"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(
        id=str(user["_id"]),
        username=user["username"],
        email=user["email"],
        full_name=user.get("full_name", ""),
        street=user.get("street", ""),
        city=user.get("city", ""),
        state=user.get("state", ""),
        latitude=user.get("latitude", 0.0),
        longitude=user.get("longitude", 0.0),
        phone=user.get("phone"),
        points=user.get("points", 0),
        reports_count=user.get("reports_count", 0),
        is_admin=user.get("is_admin", False),
        created_at=user["created_at"]
    )

@router.get("/dashboard")
async def get_user_dashboard(current_user: dict = Depends(get_current_user)):
    users_collection = get_users_collection()
    reports_collection = get_reports_collection()
    
    # Get user stats
    user = await users_collection.find_one({"_id": ObjectId(current_user["user_id"])})
    
    # Get total reports stats
    total_reports = await reports_collection.count_documents({})
    pending = await reports_collection.count_documents({"status": "pending"})
    in_progress = await reports_collection.count_documents({"status": "in_progress"})
    resolved = await reports_collection.count_documents({"status": "resolved"})
    
    # Get user's reports
    user_reports = await reports_collection.count_documents({"user_id": current_user["user_id"]})
    
    # Get recent reports by user
    recent_reports = await reports_collection.find(
        {"user_id": current_user["user_id"]}
    ).sort("timestamp", -1).limit(5).to_list(5)
    
    for report in recent_reports:
        report["id"] = str(report.pop("_id"))
    
    return {
        "total_reports": total_reports,
        "pending": pending,
        "in_progress": in_progress,
        "resolved": resolved,
        "user_reports": user_reports,
        "user_points": user.get("points", 0),
        "recent_reports": recent_reports
    }

@router.get("/leaderboard")
async def get_leaderboard(limit: int = 10):
    users_collection = get_users_collection()
    
    users = await users_collection.find().sort("points", -1).limit(limit).to_list(limit)
    
    leaderboard = []
    for idx, user in enumerate(users, 1):
        leaderboard.append({
            "rank": idx,
            "username": user["username"],
            "points": user.get("points", 0),
            "reports_count": user.get("reports_count", 0)
        })
    
    return {"leaderboard": leaderboard}


@router.get("/street-feed")
async def get_street_feed(current_user: dict = Depends(get_current_user)):
    """Get reports from user's street"""
    users_collection = get_users_collection()
    reports_collection = get_reports_collection()
    
    # Get user's street
    user = await users_collection.find_one({"_id": ObjectId(current_user["user_id"])})
    user_street = user.get("street", "")
    
    # Find all users from same street
    street_users = await users_collection.find({"street": user_street}).to_list(100)
    street_user_ids = [str(u["_id"]) for u in street_users]
    
    # Get reports from same street users
    reports = await reports_collection.find(
        {"user_id": {"$in": street_user_ids}}
    ).sort("timestamp", -1).limit(50).to_list(50)
    
    for report in reports:
        report["id"] = str(report.pop("_id"))
        report["likes_count"] = len(report.get("likes", []))
        report["comments_count"] = len(report.get("comments", []))
        report["liked_by_user"] = current_user["user_id"] in report.get("likes", [])
    
    # Get recently solved issues
    solved = await reports_collection.find(
        {"user_id": {"$in": street_user_ids}, "status": "resolved"}
    ).sort("timestamp", -1).limit(10).to_list(10)
    
    for report in solved:
        report["id"] = str(report.pop("_id"))
    
    return {
        "street": user_street,
        "reports": reports,
        "recently_solved": solved,
        "total_count": len(reports)
    }
