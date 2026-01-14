# Monday.com Portfolio Creator

This repository contains scripts to create a Portfolio in Monday.com using the GraphQL API.

## Task

Create a Portfolio named **"Duetto"** (Salesforce account name) in Monday.com workspace ID **13800719**.

## Requirements

- Monday.com API key with appropriate permissions
- Python 3 with `requests` library, OR
- Node.js (v14+), OR
- bash with `curl`

## Usage

### Using Shell Script

```bash
MONDAY_API_KEY="your-api-key" ./create_duetto_portfolio.sh
```

### Using Python Script

```bash
MONDAY_API_KEY="your-api-key" python3 create_portfolio.py
```

### Using Node.js Script

```bash
MONDAY_API_KEY="your-api-key" node create_portfolio.js
```

## GraphQL Mutation

The scripts use the following GraphQL mutation to create the portfolio:

```graphql
mutation CreatePortfolio($workspace_id: ID!, $name: String!) {
    create_folder(workspace_id: $workspace_id, name: $name, folder_kind: portfolio) {
        id
        name
    }
}
```

**Note**: The `folder_kind: portfolio` parameter is required to create a portfolio specifically, rather than a regular folder.

With variables:
- `workspace_id`: `"13800719"`
- `name`: `"Duetto"`

## API Details

- **Endpoint**: `https://api.monday.com/v2`
- **API Version**: `2024-10`
- **Authentication**: Bearer token via `Authorization` header

## GitHub Actions

A GitHub Actions workflow is included that can be triggered manually to create the portfolio.

### Setup

1. Add `MONDAY_API_KEY` as a repository secret in GitHub Settings > Secrets and variables > Actions
2. Go to Actions > "Create Monday.com Portfolio"
3. Click "Run workflow" to create the portfolio

### Manual Trigger

The workflow supports custom inputs:
- `portfolio_name`: Name of the portfolio (default: "Duetto")
- `workspace_id`: Monday.com workspace ID (default: "13800719")

## Files

- `create_portfolio.py` - Python script to create the portfolio
- `create_portfolio.js` - Node.js script to create the portfolio
- `create_duetto_portfolio.sh` - Shell script to create the portfolio
- `.github/workflows/create-portfolio.yml` - GitHub Actions workflow
- `Monday` - MCP server configuration for Monday.com
