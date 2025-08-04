# Market Finder API

REST API untuk mencari dan mengelola informasi pasar/market dengan arsitektur modular menggunakan Flask Blueprint pattern. **Dilengkapi dengan Genetic Algorithm (GA) untuk optimisasi pencarian pasar terdekat.**

## Tech Stack

### Backend Framework

-   **Flask 3.1.1** - Python web framework
-   **Flask-SQLAlchemy 3.1.1** - ORM untuk database
-   **Flask-Migrate 4.1.0** - Database migration
-   **Flask-CORS 6.0.1** - Cross-Origin Resource Sharing

### Database

-   **MySQL** - Primary database
-   **PyMySQL 1.1.1** - MySQL connector untuk Python
-   **Alembic 1.16.4** - Database migration tool

### AI/Optimization

-   **DEAP 1.4.1** - Distributed Evolutionary Algorithms in Python
-   **NumPy 1.24.3** - Numerical computing untuk GA operations

### Development Tools

-   **python-dotenv 1.1.1** - Environment variables management
-   **Marshmallow 4.0.0** - Object serialization/deserialization

### Architecture Pattern

-   **Blueprint Pattern** - Modular route organization
-   **Service Layer Pattern** - Business logic separation
-   **Repository Pattern** - Data access abstraction
-   **Genetic Algorithm Pattern** - AI-powered optimization

## API Routes

### Base URL

```
http://localhost:5000
```

### Authentication Routes (`/api/auth`)

| Method | Endpoint                      | Description         | Body Required |
| ------ | ----------------------------- | ------------------- | ------------- |
| `POST` | `/api/auth/register`          | Register new user   | ✅            |
| `POST` | `/api/auth/login`             | User login          | ✅            |
| `GET`  | `/api/auth/profile/{user_id}` | Get user profile    | ❌            |
| `PUT`  | `/api/auth/profile/{user_id}` | Update user profile | ✅            |

### Market Routes (`/api/markets`)

| Method   | Endpoint                       | Description                          | Query Parameters                         |
| -------- | ------------------------------ | ------------------------------------ | ---------------------------------------- |
| `GET`    | `/api/markets/`                | Get all markets with pagination      | `page`, `per_page`, `search`, `category` |
| `GET`    | `/api/markets/{id}`            | Get specific market                  | -                                        |
| `POST`   | `/api/markets/`                | Create new market                    | Body required                            |
| `PUT`    | `/api/markets/{id}`            | Update market                        | Body required                            |
| `DELETE` | `/api/markets/{id}`            | Delete market                        | -                                        |
| `GET`    | `/api/markets/search/location` | Search by location                   | `latitude`, `longitude`, `radius`        |
| `POST`   | `/api/markets/nearby`          | **🔥 Find nearest markets using GA** | Body required                            |

### 🚀 Genetic Algorithm Endpoint

#### `POST /api/markets/nearby`

Menggunakan **Genetic Algorithm (GA)** untuk mencari pasar terdekat berdasarkan koordinat yang diberikan. GA mengoptimalkan proses pencarian untuk mendapatkan hasil yang lebih akurat dan efisien.

**Request Body:**

```json
{
    "latitude": -6.2088,
    "longitude": 106.8456,
    "limit": 5,
    "use_ga": true
}
```

**Parameters:**

-   `latitude` (required): Latitude koordinat target (-90 to 90)
-   `longitude` (required): Longitude koordinat target (-180 to 180)
-   `limit` (optional): Jumlah pasar yang dicari (1-50, default: 5)
-   `use_ga` (optional): Gunakan GA atau simple distance (default: true)

**Response:**

```json
{
    "success": true,
    "timestamp": "2025-07-27T17:19:42.137079Z",
    "data": [
        {
            "id": 2,
            "name": "Pasar Tanah Abang",
            "description": "Pusat perdagangan tekstil terbesar di Asia Tenggara",
            "location": "Jakarta Pusat, DKI Jakarta",
            "latitude": -6.1744,
            "longitude": 106.829,
            "distance_km": 4.24,
            "is_active": true,
            "created_at": "2025-07-26T07:28:47",
            "updated_at": "2025-07-26T07:28:47"
        }
    ],
    "message": "Found 1 nearby markets",
    "meta": {
        "search_location": {
            "latitude": -6.2088,
            "longitude": 106.8456
        },
        "algorithm_used": "genetic_algorithm",
        "total_found": 1
    }
}
```

**GA Features:**

-   🧬 **Hybrid Algorithm**: Multi-strategy approach (GA + distance optimization)
-   🎯 **Deterministic Results**: Consistent results dengan coordinat-based seeding
-   📍 **Haversine Distance**: Perhitungan jarak geografis yang presisi
-   ⚡ **Smart Performance**: GA untuk dataset besar, simple sort untuk dataset kecil
-   🔄 **Consistent Output**: Hasil selalu sama untuk input yang sama
-   🛡️ **Robust Fallback**: Automatic fallback ke simple distance jika GA gagal
-   ✅ **Result Validation**: Validasi kualitas hasil dan pengecekan konsistensi

**Algorithm Details:**

1. **Deterministic Seeding**: Menggunakan seed berdasarkan koordinat target untuk hasil konsisten
2. **Multi-Strategy Search**:
    - Distance-based sorting (selalu reliable)
    - Geographic clustering (markets dalam area yang sama)
    - Weighted scoring (faktor tambahan seperti deskripsi market)
3. **Smart Selection**: Algoritma memilih strategi terbaik berdasarkan kualitas hasil
4. **Result Validation**: Validasi sorting, duplikasi, dan kualitas data
5. **Automatic Fallback**: Jika GA gagal, otomatis menggunakan simple distance calculation

### Root Route (`/`)

| Method | Endpoint | Description                             |
| ------ | -------- | --------------------------------------- |
| `GET`  | `/`      | API information and available endpoints |

## Project Structure

```
market_finder/
├── app/
│   ├── __init__.py              # Application factory & blueprint registration
│   ├── config/
│   │   ├── config.py            # Database & app configuration
│   ├── ga/                      # 🧬 Genetic Algorithm module
│   │   ├── __init__.py          # GA module initialization
│   │   └── market_finder.py     # GA implementation for market search
│   ├── logging/
│   │   ├── __init__.py          # Logging setup & configuration
│   ├── models/
│   │   ├── market.py            # Market data model
│   │   └── user.py              # User data model
│   ├── routes/                  # Blueprint definitions
│   │   ├── auth.py              # Authentication endpoints
│   │   └── market.py            # Market CRUD endpoints + GA endpoint
│   ├── services/                # Business logic layer
│   │   ├── market.py            # Market business operations
│   │   └── user.py              # User business operations
│   └── utils/
│       └── response.py          # API response utilities
├── migrations/                  # Database migration files
│   ├── alembic.ini             # Alembic configuration
│   ├── env.py                  # Migration environment
│   └── versions/               # Migration versions
├── database/
│   └── seed.py                 # Database seeding script
├── tests/
│   └── test_api.py             # API tests
├── app.py                      # Main application entry point
└── requirements.txt            # Python dependencies (includes DEAP & NumPy)
```

## Blueprint Architecture

### Route Registration

```python
# In app/__init__.py
from app.routes.market import market_bp
from app.routes.auth import auth_bp

app.register_blueprint(market_bp, url_prefix="/api/markets")
app.register_blueprint(auth_bp, url_prefix="/api/auth")
```

### Service Layer Integration

```python
# Routes call services for business logic
from app.services.market import MarketService
from app.services.user import UserService

# Routes handle HTTP, Services handle business logic
@market_bp.route("/", methods=["GET"])
def get_markets():
    result = MarketService.get_all_markets(page, per_page, search, category)
    return APIResponse.paginated_response(result)
```

## Response Format

### Standard Response

```json
{
    "success": true,
    "data": { ... },
    "message": "Operation successful"
}
```

### Paginated Response

```json
{
    "success": true,
    "data": [...],
    "pagination": {
        "page": 1,
        "per_page": 10,
        "total": 50,
        "pages": 5,
        "has_next": true,
        "has_prev": false
    }
}
```

### Error Response

```json
{
    "success": false,
    "error": "Error message",
    "details": { ... }
}
```

## Quick Start

```bash
# 1. Install dependencies (including GA libraries)
pip install -r requirements.txt

# 2. Setup database
python database/seed.py

# 3. Run application
python app.py
```

Server runs at: `http://localhost:5000`

## 🧬 Genetic Algorithm Implementation

### How it Works

1. **Initialization**: Create random population of market selections
2. **Evaluation**: Calculate fitness based on distance to target coordinates
3. **Selection**: Tournament selection for breeding
4. **Crossover**: Single-point crossover to create offspring
5. **Mutation**: Random bit-flip mutation
6. **Evolution**: Repeat for specified generations

### GA Parameters

-   **Population Size**: 50 individuals
-   **Generations**: 50 iterations
-   **Crossover Rate**: 70%
-   **Mutation Rate**: 10%
-   **Selection**: Tournament (size=3)

### Performance

-   **Small datasets** (≤ limit): Uses simple distance calculation
-   **Large datasets** (> limit): Uses GA optimization
-   **Distance calculation**: Haversine formula for accuracy

## Development

### Adding New Routes

1. **Create Blueprint** in `app/routes/`
2. **Add Service** in `app/services/` for business logic
3. **Register Blueprint** in `app/__init__.py`

### Adding GA Features

1. **Extend MarketGA** class in `app/ga/market_finder.py`
2. **Customize fitness function** for different optimization goals
3. **Adjust GA parameters** for performance tuning

### Testing GA Endpoint

#### Basic Testing

```bash
# Test with GA (recommended - konsisten dan optimal)
curl -X POST http://localhost:5000/api/markets/nearby \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -6.2088,
    "longitude": 106.8456,
    "limit": 5,
    "use_ga": true
  }'

# Test with simple distance calculation (cepat untuk dataset kecil)
curl -X POST http://localhost:5000/api/markets/nearby \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -6.2088,
    "longitude": 106.8456,
    "limit": 5,
    "use_ga": false
  }'
```

#### Consistency Testing

```bash
# Test multiple times - hasil harus konsisten
for i in {1..3}; do
  echo "Test run $i:"
  curl -X POST http://localhost:5000/api/markets/nearby \
    -H "Content-Type: application/json" \
    -d '{"latitude": -6.2088, "longitude": 106.8456, "limit": 3}' \
    | jq '.data[].name'
  echo "---"
done
```

#### Error Handling Testing

```bash
# Test invalid latitude
curl -X POST http://localhost:5000/api/markets/nearby \
  -H "Content-Type: application/json" \
  -d '{"latitude": "invalid", "longitude": 106.8456, "limit": 5}'

# Test missing required fields
curl -X POST http://localhost:5000/api/markets/nearby \
  -H "Content-Type: application/json" \
  -d '{}'

# Test with different coordinates (Bandung)
curl -X POST http://localhost:5000/api/markets/nearby \
  -H "Content-Type: application/json" \
  -d '{"latitude": -6.9034, "longitude": 107.618, "limit": 3}'
```

#### Performance Comparison

```bash
# Measure GA performance
time curl -X POST http://localhost:5000/api/markets/nearby \
  -H "Content-Type: application/json" \
  -d '{"latitude": -6.2088, "longitude": 106.8456, "limit": 5, "use_ga": true}'

# Measure simple distance performance
time curl -X POST http://localhost:5000/api/markets/nearby \
  -H "Content-Type: application/json" \
  -d '{"latitude": -6.2088, "longitude": 106.8456, "limit": 5, "use_ga": false}'
```

    "longitude": 106.8456,
    "limit": 3,
    "use_ga": false

}'

```

### Testing

Use the included Postman collection: `Market_Finder_API.postman_collection.json`

## License

MIT License
```
