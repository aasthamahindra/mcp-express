const express = require('express');
const { randomUUID } = require('crypto');
const { McpServer, ResourceTemplate } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { isInitializeRequest } = require('@modelcontextprotocol/sdk/types.js');
const { z } = require('zod');

const app = express();
app.use(express.json());

/* in-memory session store */
const sessions = {};

/* factory to create and configure a new mcp server */
function createMcpServer() {
    const server = new McpServer({
        name: 'server',
        version: '1.0.0',
        capabilities: {
            tool: { listChanged: true },
            resources: { listChanged: true },
            prompts: { listChanged: true },
        }
    });

    // register a static resource
    server.resource(
        'config',
        'config://app',
        async(uri) => {
            return {
                contents: [
                    { uri: uri.href, text: 'App configuration' }
                ]
            };
        }
    );

    // register dynamic user profile resource
    server.resource(
        'user-profile',
        new ResourceTemplate('users://{userId}/profile', { list: undefined }),
        async (uri, { userId }) => {
            return {
                contents: [{
                    uri: uri.href,
                    text: `Profile data for user ${userId}`,
                }]
            };
        }
    );
}