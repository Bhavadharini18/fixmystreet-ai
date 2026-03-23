def calculate_priority(detections: list) -> str:
    """Calculate priority based on detections"""
    if not detections:
        return "low"
    
    issue_count = len(detections)
    
    # Check for high confidence large issues
    for detection in detections:
        confidence = detection.get("confidence", 0)
        class_name = detection.get("class", "").lower()
        
        # High priority: multiple detections or high confidence potholes
        if issue_count >= 3:
            return "high"
        if "pothole" in class_name and confidence > 0.8:
            return "high"
    
    # Medium priority: normal detections
    if issue_count >= 1:
        return "medium"
    
    return "low"

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
