from fastapi import APIRouter, File, UploadFile, HTTPException, Form, Depends
from datetime import datetime
from bson import ObjectId
import base64
import requests
from typing import Optional
from auth import get_current_user
from main import reports_collection, users_collection
from config import ROBOFLOW_API_KEY, ROBOFLOW_MODEL, POINTS_PER_REPORT, POINTS_FOR_VERIFIED
from utils import (
    calculate_smart_priority,
    format_detection_result,
    check_repeat_report,
    calculate_distance,
    get_time_estimate
)

router = APIRouter()

@router.post("/report")
async def create_report(
    image: UploadFile = File(...),
    category: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        # Read image content
        content = await image.read()
        
        # Encode image to base64
        encoded_image = base64.b64encode(content).decode("utf-8")
        
        # Call Roboflow API with correct format
        url = f"https://detect.roboflow.com/{ROBOFLOW_MODEL}?api_key={ROBOFLOW_API_KEY}"
        
        # Roboflow expects the base64 string directly as the body
        response = requests.post(
            url,
            data=encoded_image,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print(f"Roboflow Response Status: {response.status_code}")
        print(f"Roboflow Response: {response.text}")
        
        if response.status_code != 200:
            # If AI detection fails, create report with manual detection
            detections = [{
                "type": category,
                "confidence": 0.85,
                "bbox": {"x": 0, "y": 0, "width": 0, "height": 0}
            }]
            issue_count = 1
        else:
            result = response.json()
            formatted = format_detection_result(result)
            detections = formatted["detections"]
            issue_count = formatted["issue_count"]
            
            # If no detections, use category as detection
            if issue_count == 0:
                detections = [{
                    "type": category,
                    "confidence": 0.85,
                    "bbox": {"x": 0, "y": 0, "width": 0, "height": 0}
                }]
                issue_count = 1
        
        # Check for repeat reports
        repeat_info = await check_repeat_report(
            reports_collection,
            latitude,
            longitude
        )
        
        # Calculate smart priority
        priority = calculate_smart_priority(
            detections,
            repeat_info["is_repeat"],
            repeat_info["repeat_count"]
        )
        
        # Get time estimate
        time_estimate = get_time_estimate(priority)
        
        # Calculate points
        points = POINTS_PER_REPORT
        if not repeat_info["is_repeat"]:
            points = POINTS_FOR_VERIFIED
        
        # Create report
        report = {
            "user_id": current_user["user_id"],
            "username": current_user["sub"],
            "category": category,
            "timestamp": datetime.utcnow().isoformat(),
            "location": {
                "latitude": latitude,
                "longitude": longitude
            },
            "detections": detections,
            "issue_count": issue_count,
            "priority": priority,
            "status": "pending",
            "estimated_days": time_estimate,
            "is_repeat": repeat_info["is_repeat"],
            "repeat_count": repeat_info["repeat_count"],
            "last_reported": repeat_info["last_reported"],
            "points_awarded": points
        }
        
        result = await reports_collection.insert_one(report)
        report["_id"] = str(result.inserted_id)
        
        # Update user points and report count
        await users_collection.update_one(
            {"_id": ObjectId(current_user["user_id"])},
            {
                "$inc": {
                    "points": points,
                    "reports_count": 1
                }
            }
        )
        
        return {
            "id": report["_id"],
            "category": report["category"],
            "timestamp": report["timestamp"],
            "location": report["location"],
            "detections": report["detections"],
            "issue_count": report["issue_count"],
            "priority": report["priority"],
            "status": report["status"],
            "estimated_days": report["estimated_days"],
            "is_repeat": report["is_repeat"],
            "repeat_count": report["repeat_count"],
            "points_awarded": report["points_awarded"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/reports")
async def get_all_reports(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = 50
):
    query = {}
    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    
    reports = await reports_collection.find(query).sort("timestamp", -1).limit(limit).to_list(limit)
    
    for report in reports:
        report["id"] = str(report.pop("_id"))
    
    return {"reports": reports, "count": len(reports)}

@router.get("/reports/{report_id}")
async def get_report(report_id: str):
    try:
        report = await reports_collection.find_one({"_id": ObjectId(report_id)})
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        report["id"] = str(report.pop("_id"))
        
        # Get related reports at same location
        related = await reports_collection.find({
            "_id": {"$ne": ObjectId(report_id)},
            "location.latitude": {"$gte": report["location"]["latitude"] - 0.001, "$lte": report["location"]["latitude"] + 0.001},
            "location.longitude": {"$gte": report["location"]["longitude"] - 0.001, "$lte": report["location"]["longitude"] + 0.001}
        }).sort("timestamp", -1).limit(5).to_list(5)
        
        for r in related:
            r["id"] = str(r.pop("_id"))
        
        report["related_reports"] = related
        
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports/user/me")
async def get_my_reports(current_user: dict = Depends(get_current_user)):
    reports = await reports_collection.find(
        {"user_id": current_user["user_id"]}
    ).sort("timestamp", -1).to_list(100)
    
    for report in reports:
        report["id"] = str(report.pop("_id"))
    
    return {"reports": reports, "count": len(reports)}

@router.get("/map/reports")
async def get_map_reports():
    """Get all reports for map display"""
    reports = await reports_collection.find().to_list(1000)
    
    map_data = []
    for report in reports:
        map_data.append({
            "id": str(report["_id"]),
            "location": report["location"],
            "priority": report["priority"],
            "status": report["status"],
            "issue_count": report["issue_count"],
            "timestamp": report["timestamp"]
        })
    
    return {"markers": map_data}
