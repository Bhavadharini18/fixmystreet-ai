from fastapi import File, UploadFile, HTTPException, Form, APIRouter
from datetime import datetime
from bson import ObjectId
import base64
import requests
from main import reports_collection, ROBOFLOW_API_KEY, ROBOFLOW_MODEL, ReportResponse, Location
from utils import calculate_priority, format_detection_result

router = APIRouter()

@router.post("/report", response_model=ReportResponse)
async def create_report(
    image: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...)
):
    """Upload image and location to detect street issues"""
    try:
        # Read image content
        content = await image.read()
        
        # Encode image to base64
        encoded_image = base64.b64encode(content).decode("utf-8")
        
        # Call Roboflow API
        url = f"https://detect.roboflow.com/{ROBOFLOW_MODEL}?api_key={ROBOFLOW_API_KEY}"
        response = requests.post(
            url,
            json=encoded_image,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Roboflow API error")
        
        result = response.json()
        
        # Format detection results
        formatted = format_detection_result(result)
        detections = formatted["detections"]
        issue_count = formatted["issue_count"]
        
        # Calculate priority
        priority = calculate_priority(detections)
        
        # Create report document
        report = {
            "timestamp": datetime.utcnow().isoformat(),
            "location": {
                "latitude": latitude,
                "longitude": longitude
            },
            "detections": detections,
            "issue_count": issue_count,
            "priority": priority
        }
        
        # Insert into MongoDB
        result = await reports_collection.insert_one(report)
        report["_id"] = str(result.inserted_id)
        
        return ReportResponse(
            id=report["_id"],
            timestamp=report["timestamp"],
            location=Location(**report["location"]),
            detections=report["detections"],
            issue_count=report["issue_count"],
            priority=report["priority"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing report: {str(e)}")

@router.get("/reports")
async def get_all_reports():
    """Get all reports"""
    try:
        reports = []
        async for report in reports_collection.find():
            report["id"] = str(report.pop("_id"))
            reports.append(report)
        return {"reports": reports, "count": len(reports)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching reports: {str(e)}")

@router.get("/reports/{report_id}")
async def get_report(report_id: str):
    """Get single report by ID"""
    try:
        report = await reports_collection.find_one({"_id": ObjectId(report_id)})
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        report["id"] = str(report.pop("_id"))
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching report: {str(e)}")
