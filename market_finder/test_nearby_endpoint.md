# Test data untuk endpoint /nearby

## Test 1: Request dengan lat/lng yang valid

POST /api/markets/nearby
Content-Type: application/json

{
"latitude": -6.2088,
"longitude": 106.8456,
"limit": 5,
"use_ga": true
}

## Response yang diharapkan:

{
"success": true,
"timestamp": "2025-01-XX...",
"data": [
{
"id": 1,
"name": "Pasar Tanah Abang",
"description": "Pasar tekstil terbesar di Asia Tenggara",
"location": "Jakarta Pusat",
"latitude": -6.1744,
"longitude": 106.8122,
"is_active": true,
"created_at": "...",
"updated_at": "...",
"distance_km": 4.2
}
],
"message": "Found 5 nearby markets",
"meta": {
"search_location": {
"latitude": -6.2088,
"longitude": 106.8456
},
"algorithm_used": "genetic_algorithm",
"total_found": 5
}
}

## Test 2: Request tanpa GA (simple distance)

POST /api/markets/nearby
Content-Type: application/json

{
"latitude": -6.2088,
"longitude": 106.8456,
"limit": 3,
"use_ga": false
}

## Test 3: Request dengan koordinat invalid

POST /api/markets/nearby
Content-Type: application/json

{
"latitude": 95.0,
"longitude": 200.0,
"limit": 5
}

## Response error yang diharapkan:

{
"success": false,
"error": {
"message": "Validation failed",
"code": "VALIDATION_ERROR",
"timestamp": "...",
"details": {
"validation_errors": [
"Latitude must be between -90 and 90",
"Longitude must be between -180 and 180"
]
}
}
}

## Test 4: Request tanpa latitude/longitude

POST /api/markets/nearby
Content-Type: application/json

{
"limit": 5
}

## Response error yang diharapkan:

{
"success": false,
"error": {
"message": "Validation failed",
"code": "VALIDATION_ERROR",
"timestamp": "...",
"details": {
"validation_errors": [
"Field 'latitude' is required",
"Field 'longitude' is required"
]
}
}
}
