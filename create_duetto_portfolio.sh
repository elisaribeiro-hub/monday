#!/bin/bash
#
# Script to create a Portfolio named "Duetto" in Monday.com workspace ID 13800719
# using GraphQL API
#
# Usage: MONDAY_API_KEY="your-api-key" ./create_duetto_portfolio.sh
#

set -e

# Configuration
WORKSPACE_ID="13800719"
PORTFOLIO_NAME="Duetto"
API_URL="https://api.monday.com/v2"

# Check for API key
if [ -z "$MONDAY_API_KEY" ]; then
    echo "Error: MONDAY_API_KEY environment variable is required"
    echo "Usage: MONDAY_API_KEY=\"your-api-key\" $0"
    exit 1
fi

echo "Creating Portfolio '$PORTFOLIO_NAME' in workspace ID $WORKSPACE_ID..."

# GraphQL mutation to create a portfolio in Monday.com
# Note: folder_kind: portfolio is required to create a portfolio (not just a folder)
QUERY=$(cat <<EOF
mutation {
    create_folder(workspace_id: $WORKSPACE_ID, name: "$PORTFOLIO_NAME", folder_kind: portfolio) {
        id
        name
    }
}
EOF
)

# Make the API request
RESPONSE=$(curl -s -X POST "$API_URL" \
    -H "Authorization: $MONDAY_API_KEY" \
    -H "Content-Type: application/json" \
    -H "API-Version: 2024-10" \
    -d "{\"query\": \"$(echo $QUERY | tr -d '\n' | sed 's/"/\\"/g')\"}")

echo "Response: $RESPONSE"

# Parse response
if echo "$RESPONSE" | grep -q '"errors"'; then
    echo ""
    echo "Error creating portfolio:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
    exit 1
elif echo "$RESPONSE" | grep -q '"create_folder"'; then
    echo ""
    echo "Successfully created Portfolio!"
    FOLDER_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['create_folder']['id'])" 2>/dev/null || echo "unknown")
    FOLDER_NAME=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['create_folder']['name'])" 2>/dev/null || echo "unknown")
    echo "Portfolio ID: $FOLDER_ID"
    echo "Portfolio Name: $FOLDER_NAME"
else
    echo ""
    echo "Unexpected response:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
    exit 1
fi
