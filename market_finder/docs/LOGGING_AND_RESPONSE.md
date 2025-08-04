# Market Finder API - Logging & Response Documentation

## 📋 Overview

Market Finder API sekarang dilengkapi dengan sistem logging yang komprehensif dan response format yang mengikuti standar RESTful API.

## 🔧 Logging System

### Konfigurasi Logging

Logging dikonfigurasi dalam `app/logging/__init__.py` dengan fitur:

-   **Multiple Log Levels**: DEBUG, INFO, WARNING, ERROR
-   **Multiple Handlers**: Console, File, API-specific logs
-   **Log Rotation**: Automatic file rotation (10MB max, 5 backup files)
-   **Structured Logging**: Different formatters for different purposes

### Log Files

Semua log disimpan di folder `logs/`:

```
logs/
├── app.log          # General application logs
├── api.log          # API-specific logs (requests/responses)
└── error.log        # Error logs only
```

### Log Levels per Module

-   **Routes** (`app.routes`): INFO level untuk API calls
-   **Services** (`app.services`): DEBUG level untuk business logic
-   **Models** (`app.models`): DEBUG level untuk database operations

## 📄 RESTful Response Format

### Success Response Format

```json
{
    "success": true,
    "timestamp": "2025-07-26T10:30:00.000Z",
    "message": "Operation completed successfully",
    "data": { ... },
    "meta": {
        "pagination": {
            "current_page": 1,
            "per_page": 10,
            "total_items": 20,
            "total_pages": 2,
            "has_next": true,
            "has_prev": false
        }
    }
}
```

### Error Response Format

```json
{
    "success": false,
    "error": {
        "message": "Error description",
        "code": "ERROR_CODE",
        "timestamp": "2025-07-26T10:30:00.000Z",
        "details": {
            "validation_errors": ["Field 'name' is required"]
        }
    }
}
```

## 🛠 API Endpoints

### 1. Get All Markets

```
GET /api/markets?page=1&per_page=10&search=pasar
```

**Response Codes:**

-   `200 OK`: Success
-   `400 Bad Request`: Invalid parameters

**Logging:**

-   INFO: Request parameters
-   DEBUG: Query details
-   INFO: Results count

### 2. Get Market by ID

```
GET /api/markets/{id}
```

**Response Codes:**

-   `200 OK`: Market found
-   `404 Not Found`: Market not found
-   `500 Internal Server Error`: Server error

**Logging:**

-   INFO: Market ID being fetched
-   WARNING: Market not found
-   INFO: Success with market name

### 3. Create Market

```
POST /api/markets
Content-Type: application/json

{
    "name": "Pasar Baru",
    "description": "Pasar tradisional di Jakarta",
    "location": "Jakarta Pusat",
    "latitude": -6.1744,
    "longitude": 106.8294
}
```

**Response Codes:**

-   `201 Created`: Market created successfully
-   `400 Bad Request`: Invalid request data
-   `422 Unprocessable Entity`: Validation errors

**Logging:**

-   INFO: Creation attempt
-   WARNING: Validation errors
-   INFO: Success with market ID

### 4. Update Market

```
PUT /api/markets/{id}
Content-Type: application/json

{
    "name": "Updated Market Name",
    "description": "Updated description"
}
```

**Response Codes:**

-   `200 OK`: Market updated
-   `404 Not Found`: Market not found
-   `400 Bad Request`: Invalid request data

**Logging:**

-   INFO: Update attempt with market ID
-   DEBUG: Field changes
-   INFO: Success

### 5. Delete Market

```
DELETE /api/markets/{id}
```

**Response Codes:**

-   `204 No Content`: Market deleted
-   `404 Not Found`: Market not found

**Logging:**

-   INFO: Deletion attempt
-   WARNING: Market not found
-   INFO: Success

### 6. Search Markets by Location

```
GET /api/markets/search/location?latitude=-6.1744&longitude=106.8294&radius=10
```

**Response Codes:**

-   `200 OK`: Search completed
-   `400 Bad Request`: Invalid coordinates

**Logging:**

-   INFO: Location search request
-   DEBUG: Search parameters
-   INFO: Results count

### 7. Search Markets by Query

```
GET /api/markets/search?q=jakarta&page=1&per_page=10
```

**Response Codes:**

-   `200 OK`: Search completed
-   `400 Bad Request`: Invalid parameters

**Logging:**

-   INFO: Text search request
-   DEBUG: Search query and pagination
-   INFO: Results count

## ⚠️ Error Handling

### Validation Errors

Semua input divalidasi menggunakan `RequestValidator` class:

-   **Required Fields**: Memastikan field wajib ada
-   **Pagination**: Validasi page dan per_page parameters
-   **Coordinates**: Validasi latitude/longitude range

### Error Codes

-   `BAD_REQUEST`: Invalid request data
-   `VALIDATION_ERROR`: Field validation failed
-   `RESOURCE_NOT_FOUND`: Resource not found
-   `INTERNAL_ERROR`: Server error

## 🚀 Running the Application

1. **Install Dependencies**:

    ```bash
    pip install -r requirements.txt
    ```

2. **Run Database Seeder**:

    ```bash
    python database/seed.py
    ```

3. **Start the Server**:

    ```bash
    python app.py
    ```

4. **Check Logs**:
    ```bash
    tail -f logs/api.log
    ```

## 📊 Monitoring

### Log Monitoring

```bash
# Monitor API logs
tail -f logs/api.log

# Monitor errors
tail -f logs/error.log

# Monitor all logs
tail -f logs/app.log
```

### API Health Check

Test basic functionality:

```bash
python tests/test_api.py
```

## 🔍 Debugging

### Enable Debug Mode

Set log level to DEBUG in `app/logging/__init__.py` untuk detailed logs:

```python
'loggers': {
    'app.routes': {
        'level': 'DEBUG',  # Change to DEBUG
        ...
    }
}
```

### Common Issues

1. **Database Connection**: Check MySQL configuration
2. **Log Permissions**: Ensure write permissions to `logs/` directory
3. **Missing Fields**: Check validation error details in response

## 📝 Example Usage

```python
import requests

# Get all markets
response = requests.get('http://localhost:5000/api/markets')
print(response.json())

# Search markets
response = requests.get('http://localhost:5000/api/markets/search?q=jakarta')
print(response.json())

# Create market
data = {
    "name": "Pasar Baru",
    "location": "Jakarta",
    "latitude": -6.1744,
    "longitude": 106.8294
}
response = requests.post('http://localhost:5000/api/markets', json=data)
print(response.json())
```
