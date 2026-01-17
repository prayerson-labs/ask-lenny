#!/bin/bash
set -e

echo "Starting MCP Lenny Quotes server..."

cd mcp-lennys-quotes

npm ci
npm run build

npm start
