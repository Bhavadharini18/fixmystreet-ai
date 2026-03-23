# Requirements Document

## Introduction

This document specifies the requirements for a Street Issue Detection Backend API that processes uploaded images to detect and classify street problems (such as potholes) using the Roboflow computer vision API. The system accepts image uploads with GPS coordinates, processes them through an external detection service, calculates priority levels based on detection results, and stores all data in MongoDB for retrieval.

## Glossary

- **API**: The Street Issue Detection Backend API system
- **Client**: The frontend application or user submitting requests to the API
- **Roboflow_Service**: The external Roboflow computer vision API (street-issues/2 model)
- **Report**: A record containing an uploaded image, detection results, location data, timestamp, and priority level
- **Detection**: An identified street issue (e.g., pothole) with type, confidence score, and bounding box coordinates
- **Priority_Level**: A classification (High, Medium, Low) indicating the urgency of addressing detected issues
- **GPS_Coordinates**: Latitude and longitude values indicating the geographic location of a report

## Requirements

### Requirement 1: Image Upload and Processing

**User Story:** As a client application, I want to upload street images for analysis, so that street issues can be automatically detected and recorded.

#### Acceptance Criteria

1. WHEN a client submits an image file to the /report endpoint, THE API SHALL accept the image in common formats (JPEG, PNG)
2. WHEN an image is received, THE API SHALL validate that the file is a valid image format
3. WHEN an invalid image format is submitted, THE API SHALL return an error response with status code 400
4. WHEN a valid image is received, THE API SHALL forward the image to the Roboflow_Service for detection
5. WHEN the Roboflow_Service returns detection results, THE API SHALL parse and extract the number of detections, issue types, confidence scores, and bounding box coordinates

### Requirement 2: Location Data Handling

**User Story:** As a client application, I want to submit GPS coordinates with each report, so that issues can be geographically tracked and mapped.

#### Acceptance Criteria

1. WHEN a client submits a report, THE API SHALL accept latitude and longitude values as GPS_Coordinates
2. WHEN GPS_Coordinates are received, THE API SHALL validate that latitude is between -90 and 90 degrees
3. WHEN GPS_Coordinates are received, THE API SHALL validate that longitude is between -180 and 180 degrees
4. WHEN invalid GPS_Coordinates are submitted, THE API SHALL return an error response with status code 400
5. WHEN valid GPS_Coordinates are received, THE API SHALL store them with the Report

### Requirement 3: Timestamp Management

**User Story:** As a system administrator, I want automatic timestamps on all reports, so that I can track when issues were reported.

#### Acceptance Criteria

1. WHEN a Report is created, THE API SHALL generate a timestamp using the server's current UTC time
2. WHEN storing a Report, THE API SHALL include the generated timestamp in the stored data
3. THE API SHALL format timestamps in ISO 8601 format

### Requirement 4: Priority Level Calculation

**User Story:** As a maintenance coordinator, I want automatic priority assignment based on detection results, so that I can address the most critical issues first.

#### Acceptance Criteria

1. WHEN a detection identifies a large pothole, THE API SHALL assign Priority_Level as High
2. WHEN multiple detections are found in a single image, THE API SHALL assign Priority_Level as High
3. WHEN a detection identifies a normal-sized pothole with a single detection, THE API SHALL assign Priority_Level as Medium
4. WHEN a detection identifies minor issues, THE API SHALL assign Priority_Level as Low
5. WHEN no detections are found, THE API SHALL assign Priority_Level as Low

### Requirement 5: Data Persistence

**User Story:** As a system administrator, I want all reports stored in MongoDB, so that data persists and can be queried efficiently.

#### Acceptance Criteria

1. WHEN a Report is successfully processed, THE API SHALL store it in MongoDB
2. WHEN storing a Report, THE API SHALL include the image data, GPS_Coordinates, timestamp, detection results, and Priority_Level
3. WHEN a storage operation fails, THE API SHALL return an error response with status code 500
4. THE API SHALL generate a unique identifier for each stored Report

### Requirement 6: Report Retrieval - Single Report

**User Story:** As a client application, I want to retrieve individual report details by ID, so that I can display specific issue information to users.

#### Acceptance Criteria

1. WHEN a client requests GET /reports/{id} with a valid Report identifier, THE API SHALL return the complete Report data
2. WHEN a client requests a non-existent Report identifier, THE API SHALL return an error response with status code 404
3. WHEN returning a Report, THE API SHALL include all stored fields: image data, detections, GPS_Coordinates, timestamp, and Priority_Level

### Requirement 7: Report Retrieval - List All Reports

**User Story:** As a client application, I want to retrieve a list of all reports, so that I can display an overview of detected street issues.

#### Acceptance Criteria

1. WHEN a client requests GET /reports, THE API SHALL return a list of all stored Reports
2. WHEN returning the list, THE API SHALL include all Report fields for each entry
3. WHEN no Reports exist in the database, THE API SHALL return an empty list with status code 200

### Requirement 8: External API Integration

**User Story:** As a system operator, I want reliable integration with the Roboflow API, so that image detection works consistently.

#### Acceptance Criteria

1. WHEN sending images to Roboflow_Service, THE API SHALL use the configured API endpoint (https://serverless.roboflow.com)
2. WHEN authenticating with Roboflow_Service, THE API SHALL use the configured API key (1t0Kt9bTXNKRXzqqIbMR)
3. WHEN requesting detection, THE API SHALL specify the model ID (street-issues/2)
4. WHEN Roboflow_Service returns an error, THE API SHALL handle the error gracefully and return an appropriate error response
5. WHEN Roboflow_Service is unavailable, THE API SHALL return an error response with status code 503

### Requirement 9: Error Handling and Validation

**User Story:** As a developer, I want clear error messages and proper validation, so that I can debug issues and ensure data quality.

#### Acceptance Criteria

1. WHEN any validation fails, THE API SHALL return a descriptive error message indicating what went wrong
2. WHEN an internal error occurs, THE API SHALL log the error details for debugging
3. WHEN returning error responses, THE API SHALL use appropriate HTTP status codes (400 for client errors, 500 for server errors, 503 for service unavailable)
4. WHEN processing requests, THE API SHALL validate all required fields are present before proceeding

### Requirement 10: API Response Format

**User Story:** As a client application developer, I want consistent JSON response formats, so that I can reliably parse API responses.

#### Acceptance Criteria

1. WHEN returning successful responses, THE API SHALL format data as JSON
2. WHEN returning error responses, THE API SHALL include an error message in JSON format
3. WHEN returning detection results from POST /report, THE API SHALL include the Report ID, detection count, issue types, confidence scores, Priority_Level, and timestamp
4. THE API SHALL set the Content-Type header to application/json for all responses
