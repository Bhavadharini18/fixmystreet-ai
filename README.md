# Street Issue Detection Backend

Backend API for detecting street issues (potholes, etc.) using Roboflow AI model.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up MongoDB (optional - defaults to localhost):
```bash
export MONGODB_URL="mongodb://localhost:27017"
```

3. Run the server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### POST /report
Upload image and GPS location to detect street issues.

**Form Data:**
- `image`: Image file (jpg/png)
- `latitude`: GPS latitude (float)
- `longitude`: GPS longitude (float)

**Response:**
```json
{
  "id": "report_id",
  "timestamp": "2024-01-01T12:00:00",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "detections": [
    {
      "type": "pothole",
      "confidence": 0.95,
      "bbox": {"x": 100, "y": 200, "width": 50, "height": 50}
    }
  ],
  "issue_count": 1,
  "priority": "high"
}
```

### GET /reports
Get all reports.

### GET /reports/{id}
Get single report by ID.

## Priority Calculation

- **High**: 3+ detections OR high confidence pothole (>0.8)
- **Medium**: 1-2 detections
- **Low**: No detections

## Testing

Visit `http://localhost:8000/docs` for interactive API documentation.
