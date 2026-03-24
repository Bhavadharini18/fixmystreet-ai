from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from auth import get_current_admin
from main import reports_collection, users_collection
from models import ReportUpdate

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats(current_admin: dict = Depends(get_current_admin)):
    total_reports = await reports_collection.count_documents({})
    pending = await reports_collection.count_documents({"status": "pending"})
    in_progress = await reports_collection.count_documents({"status": "in_progress"})
    resolved = await reports_collection.count_documents({"status": "resolved"})
    
    high_priority = await reports_collection.count_documents({"priority": "high"})
    
    total_users = await users_collection.count_documents({})
    
    # Most affected areas (top 5 locations with most reports)
    pipeline = [
        {
            "$group": {
                "_id": {
                    "lat": {"$round": ["$location.latitude", 2]},
                    "lng": {"$round": ["$location.longitude", 2]}
                },
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    
    affected_areas = await reports_collection.aggregate(pipeline).to_list(5)
    
    return {
        "total_reports": total_reports,
        "pending": pending,
        "in_progress": in_progress,
        "resolved": resolved,
        "high_priority": high_priority,
        "total_users": total_users,
        "affected_areas": affected_areas
    }

@router.put("/reports/{report_id}")
async def update_report_status(
    report_id: str,
    update: ReportUpdate,
    current_admin: dict = Depends(get_current_admin)
):
    try:
        result = await reports_collection.update_one(
            {"_id": ObjectId(report_id)},
            {
                "$set": {
                    "status": update.status,
                    "admin_notes": update.admin_notes,
                    "updated_at": datetime.utcnow().isoformat(),
                    "updated_by": current_admin["sub"]
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return {"message": "Report updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports/priority/{priority}")
async def get_reports_by_priority(
    priority: str,
    current_admin: dict = Depends(get_current_admin)
):
    reports = await reports_collection.find(
        {"priority": priority}
    ).sort("timestamp", -1).to_list(100)
    
    for report in reports:
        report["id"] = str(report.pop("_id"))
    
    return {"reports": reports, "count": len(reports)}

@router.get("/users")
async def get_all_users(current_admin: dict = Depends(get_current_admin)):
    users = await users_collection.find().sort("points", -1).to_list(100)
    
    for user in users:
        user["id"] = str(user.pop("_id"))
        user.pop("hashed_password", None)
    
    return {"users": users, "count": len(users)}

@router.delete("/reports/{report_id}")
async def delete_report(
    report_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    try:
        result = await reports_collection.delete_one({"_id": ObjectId(report_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Report not found")
        
        return {"message": "Report deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
