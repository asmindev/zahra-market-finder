# JWT Authorization Implementation - Market Finder

## Overview

Implementasi sistem authorization menggunakan JWT (JSON Web Token) untuk Market Finder application. Sistem ini membatasi akses CRUD pasar hanya untuk admin user.

## 🔐 Features Implemented

### Backend Features

1. **JWT Middleware Decorator**

    - `@token_required`: Memverifikasi JWT token valid
    - `@admin_required`: Memverifikasi user adalah admin

2. **Auth Routes**

    - `POST /api/auth/login`: Admin login dengan JWT token generation
    - `GET /api/auth/verify`: Verify JWT token validity
    - `GET /api/auth/profile`: Get current user profile
    - `PUT /api/auth/profile`: Update current user profile
    - ❌ Register endpoint dihapus (admin only system)

3. **Protected Market Routes** (Admin Only)

    - `POST /api/markets/`: Create new market
    - `PUT /api/markets/{id}`: Update market
    - `DELETE /api/markets/{id}`: Delete market

4. **Public Market Routes**
    - `GET /api/markets/`: List all markets
    - `GET /api/markets/{id}`: Get market details
    - `GET /api/markets/search`: Search markets
    - `GET /api/markets/search/location`: Search by location
    - `POST /api/markets/nearby`: Find nearby markets

### Frontend Features

1. **Authentication Context**

    - `AuthProvider`: React context for auth state management
    - `useAuth`: Hook untuk mengakses auth state

2. **Protected Routes**

    - `ProtectedRoute`: Component untuk melindungi admin routes
    - Auto redirect ke login jika tidak authenticated

3. **Login Page**

    - Admin login form dengan JWT token handling
    - Auto redirect ke admin dashboard setelah login

4. **API Service**
    - Centralized API service dengan automatic JWT header injection
    - Error handling dan response management

## 🛠️ Technical Implementation

### JWT Token Structure

```json
{
    "user_id": 1,
    "username": "admin",
    "is_admin": true,
    "exp": 1757832739,
    "iat": 1757746339
}
```

### Request Authorization Header

```
Authorization: Bearer <jwt_token>
```

### User Model Updates

```python
class User(db.Model):
    # ... existing fields ...
    is_admin = db.Column(db.Boolean, default=False)

    def generate_token(self, expires_delta=None):
        """Generate JWT token with 24h expiry"""
        # Implementation details...

    @staticmethod
    def verify_token(token):
        """Verify and decode JWT token"""
        # Implementation details...
```

## 🔧 Configuration

### Environment Variables

```bash
SECRET_KEY=dev-secret-key-for-jwt-market-finder-2024
JWT_SECRET_KEY=<same-as-secret-key>
```

### Dependencies Added

```bash
pip install pyjwt flask-sqlalchemy python-dotenv pymysql
```

## 👤 Default Admin User

```
Username: admin
Email: admin@marketfinder.com
Password: admin123
Is Admin: true
```

## 🧪 API Testing Results

### ✅ Test Results Summary

All JWT authentication tests passed successfully:

1. **✅ Admin Login**: Successfully generates JWT token
2. **✅ Invalid Login**: Correctly rejects wrong credentials
3. **✅ Token Verification**: Validates JWT token properly
4. **✅ Public Routes**: Accessible without authentication
5. **✅ Protected Routes Without Token**: Correctly blocked (401)
6. **✅ Protected Routes With Invalid Token**: Correctly rejected (401)
7. **✅ Protected Routes With Valid Token**: Successfully creates market (201)

### Sample Responses

#### Successful Login

```json
{
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "id": 1,
            "username": "admin",
            "email": "admin@marketfinder.com",
            "is_admin": true,
            "is_active": true
        }
    },
    "message": "Login successful",
    "success": true
}
```

#### Unauthorized Access

```json
{
    "error": {
        "code": "E401",
        "message": "Token is missing",
        "timestamp": "2025-09-13T06:52:19.839498Z"
    },
    "success": false
}
```

#### Admin Access Required

```json
{
    "error": {
        "code": "E403",
        "message": "Admin access required",
        "timestamp": "2025-09-13T06:52:19.842111Z"
    },
    "success": false
}
```

## 🚀 Usage Examples

### Backend - Protecting Routes

```python
from app.utils.auth import admin_required

@market_bp.route("/", methods=["POST"])
@admin_required
def create_market():
    # Only admin can access this endpoint
    pass
```

### Frontend - API Calls

```javascript
import { ApiService } from "@/services/api";

// Login
const response = await ApiService.login({
    username: "admin",
    password: "admin123",
});

// Create market (admin only)
const market = await ApiService.createMarket({
    name: "New Market",
    location: "Jakarta",
    latitude: -6.2088,
    longitude: 106.8456,
});
```

### Frontend - Protected Routes

```jsx
<Route
    path="/admin"
    element={
        <ProtectedRoute requireAdmin={true}>
            <AdminLayout />
        </ProtectedRoute>
    }
>
    <Route index element={<Dashboard />} />
    <Route path="market" element={<MarketAdmin />} />
</Route>
```

## 🔒 Security Features

1. **JWT Token Expiry**: 24 hours default expiration
2. **Admin Role Verification**: Double-check admin status in both token and database
3. **Token Validation**: Proper JWT signature verification
4. **Secure Headers**: Authorization header with Bearer token
5. **Error Handling**: Consistent error responses without exposing sensitive information

## 📝 Files Modified/Created

### Backend Files

-   `app/models/user.py`: Added JWT token methods
-   `app/utils/auth.py`: JWT middleware decorators (NEW)
-   `app/routes/auth.py`: Updated auth endpoints
-   `app/routes/market.py`: Added admin protection
-   `app/config/config.py`: Added JWT secret key
-   `create_admin.py`: Admin user creation script (NEW)
-   `test_jwt.py`: JWT test suite (NEW)

### Frontend Files

-   `src/contexts/AuthContext.jsx`: Auth context provider (NEW)
-   `src/components/ProtectedRoute.jsx`: Route protection (NEW)
-   `src/pages/auth/signin/page.jsx`: Login page (NEW)
-   `src/services/api.js`: API service with JWT (NEW)
-   `src/routes/index.jsx`: Updated with auth routes
-   `src/main.jsx`: Added AuthProvider

## 🎯 Next Steps

1. **Token Refresh**: Implement refresh token mechanism
2. **Password Reset**: Add forgot password functionality
3. **User Management**: Admin interface untuk manage users
4. **Audit Logging**: Track admin actions
5. **Rate Limiting**: Prevent brute force attacks
6. **Session Management**: Track active sessions

## 🚦 Testing

Run the test suite:

```bash
cd /home/labubu/Projects/zahra/market_finder
source .venv/bin/activate
python test_jwt.py
```

Create admin user:

```bash
python create_admin.py
```

Start development server:

```bash
flask run --host=0.0.0.0 --port=5000 --debug
```

## 🌐 Frontend Access

-   **Public Market View**: `http://localhost:3000/market`
-   **Admin Login**: `http://localhost:3000/auth/signin`
-   **Admin Dashboard**: `http://localhost:3000/admin` (requires login)

---

**🎉 JWT Authorization implementation completed successfully!**

All CRUD operations for markets are now restricted to admin users only, with proper JWT token authentication and authorization.
