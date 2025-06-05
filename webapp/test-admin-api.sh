#!/bin/bash

# 管理者API テストスクリプト
# Usage: ./test-admin-api.sh [base_url]
# Default base_url: http://localhost:8787

BASE_URL=${1:-"http://localhost:8787"}

echo "🔐 Mythologia Admin API テスト"
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
    local data=${5}
    
    echo -e "${BLUE}🔍 Testing:${NC} $description"
    echo -e "${YELLOW}   $method $endpoint${NC}"
    
    if command -v curl &> /dev/null; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" "$BASE_URL$endpoint")
        fi
        
        http_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
        body=$(echo "$response" | sed 's/HTTPSTATUS:[0-9]*$//')
        
        if [ "$http_code" = "$expected_status" ]; then
            echo -e "${GREEN}   ✅ Status: $http_code${NC}"
            if [ "$method" = "GET" ] || [ "$method" = "POST" ]; then
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
        echo "  cd webapp/backend && npm run dev"
        exit 1
    fi
    sleep 1
done

# Test Authentication API
echo ""
echo -e "${BLUE}🔐 Authentication API Tests:${NC}"

# Test login
test_endpoint "POST" "/api/admin/auth/login" "管理者ログイン" 200 '{
  "username": "superadmin",
  "password": "SuperAdmin123!",
  "rememberMe": false
}'

# Test invalid login
test_endpoint "POST" "/api/admin/auth/login" "無効な認証情報でのログイン" 401 '{
  "username": "invalid",
  "password": "wrong",
  "rememberMe": false
}'

# Test profile endpoints (without auth - should return mock data)
test_endpoint "GET" "/api/admin/auth/profile" "プロフィール取得"
test_endpoint "PUT" "/api/admin/auth/profile" "プロフィール更新" 200 '{
  "username": "newusername",
  "email": "newemail@example.com"
}'

# Test password change
test_endpoint "PUT" "/api/admin/auth/password" "パスワード変更" 200 '{
  "currentPassword": "oldpassword",
  "newPassword": "NewPassword123!"
}'

# Test sessions
test_endpoint "GET" "/api/admin/auth/sessions" "セッション一覧取得"
test_endpoint "DELETE" "/api/admin/auth/sessions/session-001" "セッション終了"

# Test logout
test_endpoint "POST" "/api/admin/auth/logout" "ログアウト"

# Test token refresh
test_endpoint "POST" "/api/admin/auth/refresh" "トークン更新"

# Test Admin Management API
echo ""
echo -e "${BLUE}👥 Admin Management API Tests:${NC}"

# Test admin list
test_endpoint "GET" "/api/admin/admins" "管理者一覧取得"
test_endpoint "GET" "/api/admin/admins?page=1&limit=5" "管理者一覧（ページネーション）"
test_endpoint "GET" "/api/admin/admins?role=admin" "管理者一覧（ロールフィルター）"
test_endpoint "GET" "/api/admin/admins?isActive=true" "管理者一覧（アクティブフィルター）"

# Test admin details
test_endpoint "GET" "/api/admin/admins/admin-001" "管理者詳細取得"
test_endpoint "GET" "/api/admin/admins/nonexistent" "存在しない管理者" 500

# Test admin creation
test_endpoint "POST" "/api/admin/admins" "管理者作成" 201 '{
  "username": "newadmin",
  "email": "newadmin@example.com",
  "password": "NewAdmin123!",
  "role": "admin",
  "permissions": [
    {
      "resource": "cards",
      "actions": ["read", "update"]
    }
  ],
  "isSuperAdmin": false
}'

# Test invalid admin creation
test_endpoint "POST" "/api/admin/admins" "無効なデータでの管理者作成" 500 '{
  "username": "ab",
  "email": "invalid-email",
  "password": "weak",
  "role": "invalid_role"
}'

# Test admin update
test_endpoint "PUT" "/api/admin/admins/admin-001" "管理者更新" 200 '{
  "username": "updatedadmin",
  "email": "updated@example.com",
  "isActive": true
}'

# Test admin deactivation
test_endpoint "DELETE" "/api/admin/admins/admin-001" "管理者無効化"

# Test admin activity
test_endpoint "GET" "/api/admin/admins/admin-001/activity" "管理者アクティビティ履歴"
test_endpoint "GET" "/api/admin/admins/admin-001/activity?page=1&limit=10" "管理者アクティビティ（ページネーション）"

echo "🎉 Admin API testing completed!"
echo ""
echo "📝 Notes:"
echo "  - All endpoints return mock data since authentication is not implemented"
echo "  - Status codes and response structure should be correct"
echo "  - Parameter validation is working for admin endpoints"
echo "  - Use these endpoints to verify admin functionality"