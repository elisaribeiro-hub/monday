#!/usr/bin/env node

/**
 * Script to create a Portfolio in Monday.com using GraphQL API.
 * Creates a portfolio named "Duetto" (Salesforce account name) in workspace ID 13800719.
 * 
 * Usage:
 *   MONDAY_API_KEY=your-api-key node create_portfolio.js
 */

const https = require('https');

// Configuration
const MONDAY_API_URL = 'api.monday.com';
const PORTFOLIO_NAME = 'Duetto';  // Salesforce account name
const WORKSPACE_ID = '13800719';

/**
 * Create a portfolio in Monday.com using GraphQL API.
 * Note: folder_kind: portfolio is required to create a portfolio (not just a folder)
 * 
 * @param {string} apiKey - Monday.com API key
 * @param {string} portfolioName - Name for the portfolio
 * @param {string} workspaceId - ID of the workspace to create the portfolio in
 * @returns {Promise<object>} API response
 */
async function createPortfolio(apiKey, portfolioName, workspaceId) {
    // GraphQL mutation to create a portfolio
    const graphqlQuery = `
        mutation CreatePortfolio($workspace_id: ID!, $name: String!) {
            create_folder(workspace_id: $workspace_id, name: $name, folder_kind: portfolio) {
                id
                name
            }
        }
    `;

    const payload = JSON.stringify({
        query: graphqlQuery,
        variables: {
            workspace_id: workspaceId,
            name: portfolioName
        }
    });

    const options = {
        hostname: MONDAY_API_URL,
        port: 443,
        path: '/v2',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': apiKey,
            'API-Version': '2024-10',
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve(response);
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${data}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(payload);
        req.end();
    });
}

async function main() {
    // Get API key from environment variable
    const apiKey = process.env.MONDAY_API_KEY;

    if (!apiKey) {
        console.error('Error: MONDAY_API_KEY environment variable is required');
        console.error('Usage: MONDAY_API_KEY=your-api-key node create_portfolio.js');
        process.exit(1);
    }

    console.log(`Creating Portfolio '${PORTFOLIO_NAME}' in workspace ID ${WORKSPACE_ID}...`);

    try {
        const response = await createPortfolio(apiKey, PORTFOLIO_NAME, WORKSPACE_ID);

        // Check for errors in the response
        if (response.errors) {
            console.error('\nGraphQL Errors:');
            response.errors.forEach(error => {
                console.error(`  - ${error.message || JSON.stringify(error)}`);
            });
            process.exit(1);
        }

        // Extract portfolio data
        const portfolioData = response.data?.create_folder;

        if (portfolioData) {
            console.log('\nSuccessfully created Portfolio!');
            console.log(`Portfolio ID: ${portfolioData.id}`);
            console.log(`Portfolio Name: ${portfolioData.name}`);
        } else {
            console.error('\nUnexpected response format:');
            console.log(JSON.stringify(response, null, 2));
            process.exit(1);
        }
    } catch (error) {
        console.error(`\nError: ${error.message}`);
        process.exit(1);
    }
}

main();
