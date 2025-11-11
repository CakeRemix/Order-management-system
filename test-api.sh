#!/bin/bash

# API Testing Script for Order Management System
# This script tests all authentication endpoints

BASE_URL="http://localhost:5000/api"

echo "=========================================="
echo "Order Management System - API Tests"
echo "=========================================="
echo ""

# Test 1: Sign Up
echo "1. Testing Sign Up (POST /api/auth/signup)"
echo "-------------------------------------------"
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "TestPassword123",
    "confirmPassword": "TestPassword123"
  }')

echo "$SIGNUP_RESPONSE" | jq '.'
SIGNUP_TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.token')
echo "Token: $SIGNUP_TOKEN"
echo ""

# Test 2: Login
echo "2. Testing Login (POST /api/auth/login)"
echo "-------------------------------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123"
  }')

echo "$LOGIN_RESPONSE" | jq '.'
LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
echo "Token: $LOGIN_TOKEN"
echo ""

# Test 3: Get Current User
echo "3. Testing Get Current User (GET /api/auth/me)"
echo "-------------------------------------------"
curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $LOGIN_TOKEN" | jq '.'
echo ""

# Test 4: Invalid Login
echo "4. Testing Invalid Login Credentials"
echo "-------------------------------------------"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "WrongPassword"
  }' | jq '.'
echo ""

# Test 5: Invalid Token
echo "5. Testing Invalid Token"
echo "-------------------------------------------"
curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer invalid_token" | jq '.'
echo ""

echo "=========================================="
echo "Tests completed!"
echo "=========================================="
