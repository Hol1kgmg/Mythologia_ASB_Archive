#!/bin/bash

# Mythologia Admiral Ship Bridge API Test Script
# Usage: ./webapp/test-api.sh [base_url] or cd webapp && ./test-api.sh [base_url]
# Default base_url: http://localhost:8787

BASE_URL=${1:-"https://mythologia-admirals-ship-bridge.vercel.app"}

echo "🧪 Mythologia Admiral Ship Bridge API テスト"
echo "📍 Base URL: $BASE_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to make HTTP request and display result
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local expected_status=${4:-200}
    
    echo -e "${BLUE}🔍 Testing:${NC} $description"
    echo -e "${YELLOW}   $method $endpoint${NC}"
    
    if command -v curl &> /dev/null; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" "$BASE_URL$endpoint")
        http_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
        body=$(echo "$response" | sed 's/HTTPSTATUS:[0-9]*$//')
        
        if [ "$http_code" = "$expected_status" ]; then
            echo -e "${GREEN}   ✅ Status: $http_code${NC}"
            if [ "$method" = "GET" ]; then
                echo "   📄 Response:"
                echo "$body" | jq '.' 2>/dev/null || echo "$body"
            fi
        else
            echo -e "${RED}   ❌ Status: $http_code (expected: $expected_status)${NC}"
            echo "   📄 Response: $body"
        fi
    else
        echo -e "${RED}   ❌ curl not found. Please install curl to run tests.${NC}"
    fi
    echo ""
}

# Wait for server to be ready
echo "⏳ Waiting for server to be ready..."
for i in {1..10}; do
    if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is ready!${NC}"
        echo ""
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}❌ Server not ready after 10 attempts${NC}"
        echo "Please make sure the server is running:"
        echo "  cd backend && npm run dev"
        exit 1
    fi
    sleep 1
done

# Test basic endpoints
test_endpoint "GET" "/" "Root endpoint"
test_endpoint "GET" "/health" "Health check"

# Test API endpoints
test_endpoint "GET" "/api/cards" "Get all cards"
test_endpoint "GET" "/api/cards?page=1&limit=10" "Get cards with pagination"
test_endpoint "GET" "/api/cards?rarity=1" "Filter cards by rarity"
test_endpoint "GET" "/api/cards?leaderId=1" "Filter cards by leader"
test_endpoint "GET" "/api/cards/non-existent-id" "Get non-existent card"

test_endpoint "GET" "/api/leaders" "Get all leaders"
test_endpoint "GET" "/api/leaders?isActive=true" "Filter active leaders"
test_endpoint "GET" "/api/leaders/1" "Get leader by ID"
test_endpoint "GET" "/api/leaders/invalid" "Get leader with invalid ID" 400

test_endpoint "GET" "/api/tribes" "Get all tribes"
test_endpoint "GET" "/api/tribes?leaderId=1" "Filter tribes by leader"
test_endpoint "GET" "/api/tribes/1" "Get tribe by ID"
test_endpoint "GET" "/api/tribes/invalid" "Get tribe with invalid ID" 400

# Test debug endpoints
echo ""
echo -e "${BLUE}🔧 Debug Information:${NC}"
test_endpoint "GET" "/debug/schema" "Database schema information"
test_endpoint "GET" "/debug/db-status" "Database connection status" 
test_endpoint "GET" "/debug/mock-data" "Mock data information"

echo "🎉 API testing completed!"
echo ""
echo "📝 Notes:"
echo "  - All endpoints return mock data since database is not connected"
echo "  - Status codes and response structure should be correct"
echo "  - Parameter validation is working for ID endpoints"
echo "  - Use /debug/* endpoints to check database status and schema"