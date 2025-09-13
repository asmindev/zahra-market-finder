#!/usr/bin/env python3
"""
Test script untuk JWT Authentication Market Finder
"""
import requests
import json

BASE_URL = "http://localhost:5000/api"


def test_login():
    """Test admin login"""
    print("🔐 Testing Admin Login...")

    login_data = {"username": "admin", "password": "admin123"}

    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")

        if response.status_code == 200:
            token = response.json()["data"]["token"]
            print(f"✅ Login successful! Token: {token[:50]}...")
            return token
        else:
            print("❌ Login failed!")
            return None

    except Exception as e:
        print(f"❌ Error during login: {e}")
        return None


def test_invalid_login():
    """Test login with invalid credentials"""
    print("\n🚫 Testing Invalid Login...")

    login_data = {"username": "admin", "password": "wrongpassword"}

    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")

        if response.status_code == 401:
            print("✅ Invalid login correctly rejected!")
        else:
            print("❌ Invalid login should have been rejected!")

    except Exception as e:
        print(f"❌ Error during invalid login test: {e}")


def test_token_verification(token):
    """Test token verification endpoint"""
    if not token:
        print("\n❌ No token available for verification test")
        return

    print("\n🔍 Testing Token Verification...")

    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = requests.get(f"{BASE_URL}/auth/verify", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")

        if response.status_code == 200:
            print("✅ Token verification successful!")
        else:
            print("❌ Token verification failed!")

    except Exception as e:
        print(f"❌ Error during token verification: {e}")


def test_protected_route_without_token():
    """Test accessing protected route without token"""
    print("\n🚫 Testing Protected Route Access Without Token...")

    market_data = {
        "name": "Test Market",
        "location": "Test Location",
        "latitude": -6.2088,
        "longitude": 106.8456,
    }

    try:
        response = requests.post(f"{BASE_URL}/markets/", json=market_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")

        if response.status_code == 401:
            print("✅ Protected route correctly blocked without token!")
        else:
            print("❌ Protected route should have been blocked!")

    except Exception as e:
        print(f"❌ Error during protected route test: {e}")


def test_protected_route_with_token(token):
    """Test accessing protected route with valid token"""
    if not token:
        print("\n❌ No token available for protected route test")
        return

    print("\n🔒 Testing Protected Route Access With Valid Token...")

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    market_data = {
        "name": "Test Market from JWT",
        "location": "Jakarta, Indonesia",
        "latitude": -6.2088,
        "longitude": 106.8456,
        "description": "Market created via JWT authenticated request",
    }

    try:
        response = requests.post(
            f"{BASE_URL}/markets/", json=market_data, headers=headers
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")

        if response.status_code == 201:
            print("✅ Protected route access successful with valid token!")
            return response.json()["data"]["id"]
        else:
            print("❌ Protected route access failed!")
            return None

    except Exception as e:
        print(f"❌ Error during protected route test: {e}")
        return None


def test_invalid_token():
    """Test accessing protected route with invalid token"""
    print("\n🚫 Testing Protected Route Access With Invalid Token...")

    headers = {
        "Authorization": "Bearer invalid.token.here",
        "Content-Type": "application/json",
    }

    market_data = {"name": "Test Market", "location": "Test Location"}

    try:
        response = requests.post(
            f"{BASE_URL}/markets/", json=market_data, headers=headers
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")

        if response.status_code == 401:
            print("✅ Invalid token correctly rejected!")
        else:
            print("❌ Invalid token should have been rejected!")

    except Exception as e:
        print(f"❌ Error during invalid token test: {e}")


def test_public_routes():
    """Test public routes that don't require authentication"""
    print("\n🌐 Testing Public Routes (Market List)...")

    try:
        response = requests.get(f"{BASE_URL}/markets/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")

        if response.status_code == 200:
            print("✅ Public route access successful!")
        else:
            print("❌ Public route access failed!")

    except Exception as e:
        print(f"❌ Error during public route test: {e}")


def main():
    """Run all JWT tests"""
    print("=" * 60)
    print("🧪 JWT AUTHENTICATION TEST SUITE")
    print("=" * 60)

    # Test 1: Valid login
    token = test_login()

    # Test 2: Invalid login
    test_invalid_login()

    # Test 3: Token verification
    test_token_verification(token)

    # Test 4: Public routes
    test_public_routes()

    # Test 5: Protected route without token
    test_protected_route_without_token()

    # Test 6: Protected route with invalid token
    test_invalid_token()

    # Test 7: Protected route with valid token
    market_id = test_protected_route_with_token(token)

    print("\n" + "=" * 60)
    print("🎯 JWT AUTHENTICATION TEST COMPLETED")
    print("=" * 60)

    if token:
        print(f"✅ Admin token: {token[:50]}...")
        if market_id:
            print(f"✅ Test market created with ID: {market_id}")


if __name__ == "__main__":
    main()
