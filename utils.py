import math
from datetime import datetime, timedelta
from config import TIME_ESTIMATES, LOCATION_PROXIMITY_THRESHOLD, PRIORITY_WEIGHTS

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates in meters using Haversine formula"""
    R = 6371000  # Earth's radius in meters
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

async def check_repeat_report(collection, latitude: float, longitude: float) -> dict:
    """Check if this location has been reported before"""
    # Find reports within proximity threshold
    nearby_reports = await collection.find({
        "location.latitude": {
            "$gte": latitude - 0.001,
            "$lte": latitude + 0.001
        },
        "location.longitude": {
            "$gte": longitude - 0.001,
            "$lte": longitude + 0.001
        }
    }).to_list(100)
    
    repeat_count = 0
    last_reported = None
    is_repeat = False
    
    for report in nearby_reports:
        distance = calculate_distance(
            latitude,
            longitude,
            report["location"]["latitude"],
            report["location"]["longitude"]
        )
        
        if distance <= LOCATION_PROXIMITY_THRESHOLD:
            repeat_count += 1
            if not last_reported or report["timestamp"] > last_reported:
                last_reported = report["timestamp"]
            is_repeat = True
    
    return {
        "is_repeat": is_repeat,
        "repeat_count": repeat_count,
        "last_reported": last_reported
    }

def calculate_smart_priority(detections: list, is_repeat: bool, repeat_count: int) -> str:
    """Calculate priority based on multiple factors"""
    if not detections:
        return "low"
    
    issue_count = len(detections)
    avg_confidence = sum(d.get("confidence", 0) for d in detections) / issue_count
    
    # Calculate score
    detection_score = min(issue_count / 3, 1.0)  # Normalize to 0-1
    confidence_score = avg_confidence
    repeat_score = min(repeat_count / 5, 1.0) if is_repeat else 0
    
    # Weighted score
    total_score = (
        detection_score * PRIORITY_WEIGHTS["detection_count"] +
        confidence_score * PRIORITY_WEIGHTS["confidence"] +
        repeat_score * PRIORITY_WEIGHTS["repeat_reports"]
    )
    
    # Determine priority
    if total_score >= 0.7 or issue_count >= 3:
        return "high"
    elif total_score >= 0.4 or issue_count >= 2:
        return "medium"
    else:
        return "low"

def get_time_estimate(priority: str) -> dict:
    """Get estimated fix time based on priority"""
    estimate = TIME_ESTIMATES.get(priority, TIME_ESTIMATES["low"])
    return {
        "min_days": estimate["min"],
        "max_days": estimate["max"],
        "message": f"{estimate['min']}-{estimate['max']} days"
    }

def format_detection_result(result: dict) -> dict:
    """Format Roboflow detection result"""
    predictions = result.get("predictions", [])
    
    detections = []
    for pred in predictions:
        detections.append({
            "type": pred.get("class", "unknown"),
            "confidence": round(pred.get("confidence", 0), 2),
            "bbox": {
                "x": pred.get("x"),
                "y": pred.get("y"),
                "width": pred.get("width"),
                "height": pred.get("height")
            }
        })
    
    return {
        "detections": detections,
        "issue_count": len(detections)
    }
