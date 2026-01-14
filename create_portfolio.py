#!/usr/bin/env python3
"""
Script to create a Portfolio in Monday.com using GraphQL API.
Creates a portfolio named "Duetto" (Salesforce account name) in workspace ID 13800719.

Usage:
    MONDAY_API_KEY="your-api-key" python3 create_portfolio.py
"""

import os
import sys
import json
import requests

# Configuration
WORKSPACE_ID = "13800719"
PORTFOLIO_NAME = "Duetto"  # Salesforce account name
API_URL = "https://api.monday.com/v2"


def create_portfolio(api_key: str, workspace_id: str, name: str) -> dict:
    """
    Create a portfolio (folder) in Monday.com using GraphQL API.
    
    Args:
        api_key: Monday.com API key
        workspace_id: ID of the workspace to create the portfolio in
        name: Name of the portfolio to create
        
    Returns:
        dict: Response data from the API
    """
    headers = {
        "Authorization": api_key,
        "Content-Type": "application/json",
        "API-Version": "2024-10"
    }
    
    # GraphQL mutation to create a portfolio in Monday.com
    # Note: folder_kind: portfolio is required to create a portfolio (not just a folder)
    mutation = """
    mutation CreatePortfolio($workspace_id: ID!, $name: String!) {
        create_folder(workspace_id: $workspace_id, name: $name, folder_kind: portfolio) {
            id
            name
        }
    }
    """
    
    variables = {
        "workspace_id": workspace_id,
        "name": name
    }
    
    payload = {
        "query": mutation,
        "variables": variables
    }
    
    response = requests.post(API_URL, headers=headers, json=payload)
    response.raise_for_status()
    
    return response.json()


def main():
    # Get API key from environment variable
    api_key = os.environ.get("MONDAY_API_KEY")
    
    if not api_key:
        print("Error: MONDAY_API_KEY environment variable is required", file=sys.stderr)
        print(f"Usage: MONDAY_API_KEY=\"your-api-key\" python3 {sys.argv[0]}", file=sys.stderr)
        sys.exit(1)
    
    print(f"Creating Portfolio '{PORTFOLIO_NAME}' in workspace ID {WORKSPACE_ID}...")
    
    try:
        result = create_portfolio(api_key, WORKSPACE_ID, PORTFOLIO_NAME)
        
        if "errors" in result:
            print(f"\nGraphQL Errors:")
            print(json.dumps(result["errors"], indent=2))
            sys.exit(1)
        
        if "data" in result and result["data"].get("create_folder"):
            folder = result["data"]["create_folder"]
            print(f"\nSuccessfully created Portfolio!")
            print(f"Portfolio ID: {folder['id']}")
            print(f"Portfolio Name: {folder['name']}")
        else:
            print(f"\nUnexpected response format:")
            print(json.dumps(result, indent=2))
            sys.exit(1)
            
    except requests.exceptions.RequestException as e:
        print(f"\nHTTP Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
