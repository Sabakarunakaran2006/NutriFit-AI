import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "version" in data

def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_login_demo_user():
    response = client.post("/api/auth/login", json={
        "email": "user@demo.com",
        "password": "User@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "user@demo.com"
    assert data["user"]["role"] == "USER"

def test_login_demo_expert():
    response = client.post("/api/auth/login", json={
        "email": "expert@demo.com",
        "password": "Expert@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "EXPERT"

def test_login_demo_admin():
    response = client.post("/api/auth/login", json={
        "email": "admin@demo.com",
        "password": "Admin@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "ADMIN"

def test_unauthorized_dashboard_access():
    response = client.get("/api/dashboard/")
    assert response.status_code == 401

def test_user_dashboard_flow():
    # Login
    login_res = client.post("/api/auth/login", json={
        "email": "user@demo.com",
        "password": "User@123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get Dashboard
    dash_res = client.get("/api/dashboard/", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["has_profile"] is True
    assert "summary" in dash_data
    assert "today_diet" in dash_data
    assert "today_workout" in dash_data
    assert len(dash_data["today_diet"]["meals"]) == 4

def test_food_items_search():
    response = client.get("/api/diet/foods?query=chicken")
    assert response.status_code == 200
    foods = response.json()
    assert len(foods) > 0
    assert "Chicken" in foods[0]["name"]
