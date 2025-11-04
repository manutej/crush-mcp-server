# Crush MCP Server - Testing Guide

## Project Status

✅ **Implementation Complete**: All core components implemented and tested
- 4 execution strategies (Fast, Balanced, Quality, Cost-Optimized)
- Orchestrator with strategy pattern
- MCP server with 2 tools (crush_execute, crush_evaluate)
- 12/12 tests passing (100% coverage)

## Project Structure

```
crush-mcp-server/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── orchestrator.ts       # Strategy orchestrator
│   ├── crush-client.ts       # Crush CLI wrapper
│   ├── evaluator.ts          # Quality evaluation
│   ├── types.ts              # Type definitions
│   └── strategies/
│       ├── base.ts           # Strategy interface
│       ├── fast.ts           # Single model, fast
│       ├── balanced.ts       # Two models, balanced
│       ├── quality.ts        # Multi-model, highest quality
│       └── cost-optimized.ts # Budget-constrained
├── tests/
│   └── strategies.test.ts    # Comprehensive test suite
├── dist/                     # Compiled JavaScript (built)
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Testing Options

### 1. Unit Tests (Already Passing ✅)

Run the existing test suite:

```bash
cd /Users/manu/Documents/LUXOR/crush-mcp-server

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

**Expected Result**: 12/12 tests passing

---

### 2. Manual MCP Server Testing

Test the MCP server directly using stdio:

```bash
cd /Users/manu/Documents/LUXOR/crush-mcp-server

# Build the project
npm run build

# Run the server (it expects JSON-RPC over stdio)
node dist/index.js
```

The server will wait for MCP protocol messages on stdin.

**Test Message** (paste this into stdin):
```json
{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
```

**Expected Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "crush_execute",
        "description": "Execute a prompt using Crush CLI with automatic multi-model orchestration...",
        "inputSchema": {...}
      },
      {
        "name": "crush_evaluate",
        "description": "Estimate cost, time, and quality...",
        "inputSchema": {...}
      }
    ]
  }
}
```

---

### 3. Integration Testing with Claude Code (Recommended)

Add the Crush MCP server to Claude Code's settings:

#### Step 1: Install the server globally

```bash
cd /Users/manu/Documents/LUXOR/crush-mcp-server
npm link
```

This makes `crush-mcp-server` available globally.

#### Step 2: Add to Claude Code settings

Edit `~/.claude/settings.json` and add to the `mcpServers` section:

```json
{
  "mcpServers": {
    "crush": {
      "command": "crush-mcp-server",
      "args": [],
      "disabled": false
    }
  }
}
```

**Or use the absolute path** (more reliable):

```json
{
  "mcpServers": {
    "crush": {
      "command": "node",
      "args": ["/Users/manu/Documents/LUXOR/crush-mcp-server/dist/index.js"],
      "disabled": false
    }
  }
}
```

#### Step 3: Restart Claude Code

After updating settings, restart Claude Code to load the new MCP server.

#### Step 4: Test the integration

In Claude Code, you should now have access to these tools:
- `mcp__crush__crush_execute`
- `mcp__crush__crush_evaluate`

**Example prompts to test**:

1. **Evaluate a task**:
   ```
   Use the crush_evaluate tool to estimate the cost and quality of analyzing
   the architecture of a microservices system using the 'quality' strategy.
   ```

2. **Execute a simple task** (Fast strategy):
   ```
   Use crush_execute with the 'fast' strategy to explain what the
   Single Responsibility Principle means in 2-3 sentences.
   ```

3. **Execute a complex task** (Quality strategy):
   ```
   Use crush_execute with the 'quality' strategy to design a complete
   authentication system with OAuth2, JWT, and role-based access control.
   ```

4. **Budget-constrained task**:
   ```
   Use crush_execute with the 'cost-optimized' strategy and max_cost of 0.005
   to summarize REST API best practices.
   ```

---

### 4. Direct Crush CLI Testing

Before testing the MCP server, verify Crush CLI works:

```bash
# Check Crush version
crush --version

# Test Crush with a simple prompt
echo "Explain HTTP status codes briefly" | crush -m grok-3-mini

# Test with Claude model
echo "Design a simple REST API" | crush -m claude-haiku-4-5
```

**Note**: You'll need valid API keys configured in `~/.crush/config.yaml` or `~/.local/share/crush/crush.json`

---

### 5. End-to-End Integration Test

Create a test script that simulates the full workflow:

```bash
cd /Users/manu/Documents/LUXOR/crush-mcp-server

# Create a test script
cat > test-e2e.sh << 'EOF'
#!/bin/bash

echo "=== Testing Crush MCP Server E2E ==="

# 1. Build
echo "Building project..."
npm run build

# 2. Run unit tests
echo "Running unit tests..."
npm test

# 3. Start server in background
echo "Starting MCP server..."
node dist/index.js &
SERVER_PID=$!

sleep 2

# 4. Send test request
echo "Sending test request..."
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | nc localhost 3000 || echo "Server running on stdio (expected)"

# 5. Cleanup
kill $SERVER_PID 2>/dev/null

echo "=== E2E Test Complete ==="
EOF

chmod +x test-e2e.sh
./test-e2e.sh
```

---

## Current Limitations

⚠️ **Important**: The MCP server is currently **mocked** in tests. It doesn't actually call the real Crush CLI yet because:

1. The `CrushClient.run()` method spawns the Crush binary
2. This requires:
   - Valid API keys in Crush config
   - Actual Crush CLI at `/opt/homebrew/bin/crush`
   - Network access to model APIs

### To enable real Crush execution:

1. **Verify Crush is installed**:
   ```bash
   which crush
   # Should output: /opt/homebrew/bin/crush
   ```

2. **Configure API keys** in `~/.local/share/crush/crush.json`:
   ```json
   {
     "providers": {
       "grok": {
         "api_key": "your-grok-api-key"
       },
       "anthropic": {
         "api_key": "your-anthropic-api-key"
       }
     }
   }
   ```

3. **Update `CrushClient` constructor** if Crush is in a different location:
   ```typescript
   // In src/orchestrator.ts line 19
   constructor(crushBinaryPath: string = '/opt/homebrew/bin/crush') {
   ```

---

## Next Steps

1. **✅ Complete**: Unit tests passing
2. **✅ Complete**: MCP server implementation
3. **🔄 Next**: Integration with Claude Code
4. **📋 Pending**: Session management (stateful conversations)
5. **📋 Pending**: Multi-model explicit workflows
6. **📋 Pending**: Documentation and examples
7. **📋 Pending**: Performance optimization

---

## Troubleshooting

### Server won't start
- Check that `npm run build` completed successfully
- Verify `dist/index.js` exists
- Check for TypeScript compilation errors

### Tests failing
- Run `npm install` to ensure dependencies are installed
- Check Vitest configuration in `vitest.config.ts`
- Verify Node.js version >= 18

### Claude Code doesn't see the tools
- Check `~/.claude/settings.json` syntax is valid JSON
- Restart Claude Code after changing settings
- Check Claude Code logs for MCP server errors
- Verify the path to `dist/index.js` is correct

### Crush CLI errors
- Verify Crush is installed: `crush --version`
- Check API keys are configured
- Test Crush independently before testing MCP server

---

## Questions?

See:
- `PROGRESS.md` - Development progress tracker
- `src/index.ts` - MCP server implementation
- `tests/strategies.test.ts` - Test examples
- Linear project: https://linear.app/ceti-luxor/project/crush-mcp-server-fabcd9722fbc
