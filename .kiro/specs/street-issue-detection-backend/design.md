# Design Document: Street Issue Detection Backend

## Overview

The Street Issue Detection Backend is a REST API built with FastAPI that serves as an intermediary between a client application and the Roboflow computer vision service. The system accepts image uploads with GPS coordinates, processes them through Roboflow's street-issues/2 model, calculates priority levels based on detection results, and persists all data to MongoDB.

The architecture follows a simple three-layer pattern:
1. **API Layer**: FastAPI endpoints handling HTTP requests/responses
2. **Service Layer**: Business logic for detection processing and priority calculation
3. **Data Layer**: MongoDB integration for persistence

## Architecture

### System Components

```
┌─────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│   Client    │────────▶│   FastAPI Backend    │────────▶│   Roboflow API  │
│ Application │         │                      │         │  (Detection)    │
└─────────────┘         │  - API Endpoints     │         └─────────────────┘
                        │  - Validation        │
                        │  - Priority Logic    │
                        │  - Error Handling    │
                        └──────────┬───────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │      MongoDB         │
                        │  (Data Persistence)  │
                        └──────────────────────┘
```

### Technology Stack

- **Framework**: FastAPI (Python 3.8+)
- **Database**: MongoDB with Motor (async driver)
- **HTTP Client**: httpx (for Roboflow API calls)
- **Validation**: Pydantic models
- **Image Processing**: Pillow (PIL) for validation

## Components and Interfaces

### 1. API Endpoints

#### POST /report
```python
Request:
  - Content-Type: multipart/form-data
  - Fields:
    - image: File (JPEG/PNG)
    - latitude: float (-90 to 90)
    - longitude: float (-180 to 180)

Response (200 OK):
  {
    "id": "string",
    "detections": [
      {
        "type": "string",
        "confidence": float,
        "bbox": {"x": int, "y": int, "width": int, "height": int}
      }
    ],
    "detection_count": int,
    "priority": "High" | "Medium" | "Low",
    "location": {"latitude": float, "longitude": float},
    "timestamp": "ISO8601 string"
  }

Error Responses:
  - 400: Invalid input (bad image format, invalid coordinates)
  - 503: Roboflow service unavailable
  - 500: Internal server error
```

#### GET /reports
```python
Response (200 OK):
  {
    "reports": [
      {
        "id": "string",
        "detections": [...],
        "detection_count": int,
        "priority": "string",
        "location": {...},
        "timestamp": "string",
        "image_url": "string"
      }
    ]
  }
```

#### GET /reports/{id}
```python
Response (200 OK):
  {
    "id": "string",
    "detections": [...],
    "detection_count": int,
    "priority": "string",
    "location": {...},
    "timestamp": "string",
    "image_url": "string"
  }

Error Responses:
  - 404: Report not found
```

### 2. Service Layer Components

#### RoboflowService
Handles communication with the Roboflow API.

```python
class RoboflowService:
    def __init__(self, api_key: str, model_id: str):
        self.api_url = "https://serverless.roboflow.com"
        self.api_key = api_key
        self.model_id = model_id
    
    async def detect_issues(self, image_bytes: bytes) -> DetectionResult:
        """
        Sends image to Roboflow API and returns detection results.
        
        Returns:
          DetectionResult with predictions list
        
        Raises:
          RoboflowAPIError: When API call fails
        """
```

#### PriorityCalculator
Determines priority level based on detection results.

```python
class PriorityCalculator:
    @staticmethod
    def calculate_priority(detections: List[Detection]) -> str:
        """
        Calculates priority based on:
        - Number of detections (multiple = High)
        - Issue type and size (large pothole = High)
        - Default to Medium for single normal pothole
        - Low for minor issues or no detections
        
        Returns: "High", "Medium", or "Low"
        """
```

#### ImageValidator
Validates uploaded image files.

```python
class ImageValidator:
    ALLOWED_FORMATS = ["JPEG", "PNG"]
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    @staticmethod
    def validate_image(file_bytes: bytes) -> bool:
        """
        Validates image format and size.
        
        Raises:
          ValidationError: If image is invalid
        """
```

### 3. Data Layer

#### MongoDB Schema

**Collection: reports**
```javascript
{
  "_id": ObjectId,
  "image_data": Binary,  // Base64 encoded image
  "detections": [
    {
      "type": String,
      "confidence": Number,
      "bbox": {
        "x": Number,
        "y": Number,
        "width": Number,
        "height": Number
      }
    }
  ],
  "detection_count": Number,
  "priority": String,  // "High", "Medium", "Low"
  "location": {
    "latitude": Number,
    "longitude": Number
  },
  "timestamp": ISODate,
  "created_at": ISODate
}
```

#### ReportRepository
Handles database operations.

```python
class ReportRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.reports
    
    async def create_report(self, report: Report) -> str:
        """Inserts report and returns ID"""
    
    async def get_report(self, report_id: str) -> Optional[Report]:
        """Retrieves single report by ID"""
    
    async def get_all_reports(self) -> List[Report]:
        """Retrieves all reports"""
```

## Data Models

### Pydantic Models

```python
class Location(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int

class Detection(BaseModel):
    type: str
    confidence: float = Field(..., ge=0, le=1)
    bbox: BoundingBox

class ReportCreate(BaseModel):
    image: bytes
    location: Location

class ReportResponse(BaseModel):
    id: str
    detections: List[Detection]
    detection_count: int
    priority: str
    location: Location
    timestamp: datetime
    image_url: Optional[str] = None
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

