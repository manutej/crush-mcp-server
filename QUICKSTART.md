# Crush MCP Server - Quickstart Guide

**Get started in 5 minutes** ⚡

## What is This?

A Model Context Protocol (MCP) server that lets Claude Code orchestrate multiple AI models through Crush CLI. Think of it as giving Claude Code a "meta-brain" that can intelligently route tasks to different models based on your needs.

## Prerequisites

- ✅ Node.js >= 18
- ✅ Claude Code installed
- ✅ Crush CLI installed (`brew install crush` or from https://github.com/crush/crush)
- ⚠️  API keys configured in Crush (for real execution - optional for testing)

## Installation (2 minutes)

### Step 1: Clone or Navigate to Project

```bash
cd /Users/manu/Documents/LUXOR/crush-mcp-server
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Build the Server

```bash
npm run build
```

### Step 4: Link Globally

```bash
npm link
```

✅ **Status**: Server is now installed and ready!

---

## Integration with Claude Code (3 minutes)

### Already Done ✅

The Crush MCP server has been added to your Claude Code settings at:
`~/.claude/settings.json`

Configuration:
```json
{
  "name": "crush",
  "description": "Crush CLI multi-model orchestration MCP server",
  "type": "local",
  "command": "node",
  "args": [
    "/Users/manu/Documents/LUXOR/crush-mcp-server/dist/index.js"
  ]
}
```

### Next: Restart Claude Code

**Important**: Close and restart Claude Code completely to load the new MCP server.

1. Quit Claude Code (⌘Q on Mac)
2. Reopen Claude Code
3. The `crush` MCP server will now be available

---

## Quick Test (30 seconds)

After restarting Claude Code, try these prompts:

### Test 1: Check Available Tools
```
What MCP tools do I have available? Show me the crush tools.
```

You should see:
- `mcp__crush__crush_execute`
- `mcp__crush__crush_evaluate`

### Test 2: Fast Strategy (Quick Answer)
```
Use the crush_execute tool with the 'fast' strategy to explain
what REST APIs are in 2-3 sentences.
```

**Expected**: Quick response using grok-3-mini model (~5 seconds, ~$0.002)

### Test 3: Evaluate Before Execute
```
Use crush_evaluate to estimate the cost and time for explaining
microservices architecture using the 'quality' strategy.
```

**Expected**: Estimation without execution (estimated_cost, estimated_time_seconds, expected_quality)

### Test 4: Quality Strategy (Detailed Answer)
```
Use crush_execute with the 'quality' strategy to design a complete
REST API for a blog system with posts, comments, and users.
```

**Expected**: Comprehensive response with multiple models (~30-45 seconds, ~$0.05-0.10)

---

## The 4 Execution Strategies

Choose based on your needs:

| Strategy | Speed | Cost | Quality | Use Case |
|----------|-------|------|---------|----------|
| **fast** | ⚡ <10s | 💰 <$0.005 | ⭐ 0.6 | Quick answers, simple queries |
| **balanced** | ⏱️ <30s | 💰💰 ~$0.015 | ⭐⭐ 0.75 | Default, good quality/cost |
| **quality** | ⏳ <60s | 💰💰💰 ~$0.06 | ⭐⭐⭐ 0.9 | Detailed analysis, complex designs |
| **cost-optimized** | ⚡ <10s | 💰 Custom | ⭐ 0.5 | Strict budget constraints |

---

## How It Works

```
┌─────────────┐
│   You       │
└──────┬──────┘
       │ "Design a REST API using quality strategy"
       ▼
┌─────────────────────┐
│   Claude Code       │
└──────┬──────────────┘
       │ MCP Protocol
       ▼
┌─────────────────────┐
│ Crush MCP Server    │  ← This project
│ (Orchestrator)      │
└──────┬──────────────┘
       │ Chooses strategy
       ▼
┌─────────────────────┐
│    Crush CLI        │
└──────┬──────────────┘
       │ Model API calls
       ▼
┌──────────────────────────────────┐
│  grok-3-mini → claude-sonnet-4-5 │  ← Multiple models
│  (outline)      (detailed design) │
└──────────────────────────────────┘
```

---

## Example Prompts

### Fast Strategy (Quick & Cheap)
```
Use crush_execute with fast strategy to:
- Explain HTTP status codes
- List the SOLID principles
- Define what a REST API is
```

### Balanced Strategy (Default)
```
Use crush_execute with balanced strategy to:
- Design a simple authentication system
- Explain microservices architecture with examples
- Create a database schema for a todo app
```

### Quality Strategy (Comprehensive)
```
Use crush_execute with quality strategy to:
- Design a complete e-commerce platform architecture
- Create a comprehensive API spec with all endpoints
- Write a detailed implementation plan for OAuth2
```

### Cost-Optimized Strategy
```
Use crush_execute with cost-optimized strategy and max_cost 0.005 to:
- Summarize key points about Docker
- List best practices for API design
```

---

## Verify Installation

Run these commands to verify everything is set up:

```bash
# Check tests pass
cd /Users/manu/Documents/LUXOR/crush-mcp-server
npm test

# Expected: ✓ 12 passed (12)

# Check server can start
node dist/index.js &
SERVER_PID=$!
sleep 2
kill $SERVER_PID

# Expected: No errors (server starts and stops cleanly)

# Check Crush CLI is available
which crush
# Expected: /opt/homebrew/bin/crush

# Check Crush version
crush --version
# Expected: crush version 0.13.x or later
```

---

## Troubleshooting

### "crush tools not showing in Claude Code"

1. **Restart Claude Code completely** (⌘Q and reopen)
2. Check settings file has correct path:
   ```bash
   cat ~/.claude/settings.json | grep -A 5 '"name": "crush"'
   ```
3. Verify build succeeded:
   ```bash
   ls -la /Users/manu/Documents/LUXOR/crush-mcp-server/dist/index.js
   ```

### "Tests fail with Crush binary not found"

Tests use mocked Crush calls - they don't need the real binary. If tests fail:
```bash
npm install  # Re-install dependencies
npm test     # Should pass without Crush
```

### "Real execution doesn't work"

For actual Crush execution (not mocked), you need:

1. **Crush installed and in PATH**:
   ```bash
   which crush
   # Should output: /opt/homebrew/bin/crush
   ```

2. **API keys configured**:
   ```bash
   # Check Crush config
   cat ~/.local/share/crush/crush.json

   # Or create it:
   mkdir -p ~/.local/share/crush
   cat > ~/.local/share/crush/crush.json << 'EOF'
   {
     "providers": {
       "grok": {
         "api_key": "your-grok-api-key-here"
       },
       "anthropic": {
         "api_key": "your-anthropic-api-key-here"
       }
     }
   }
   EOF
   ```

3. **Test Crush directly**:
   ```bash
   echo "What is 2+2?" | crush -m grok-3-mini
   ```

### "Server crashes on execution"

Check logs and permissions:
```bash
# Check Node version
node --version
# Should be >= 18

# Check file permissions
ls -la dist/index.js
# Should be readable

# Run with debug output
NODE_ENV=development node dist/index.js
```

---

## What's Next?

### For Testing
- ✅ Run unit tests: `npm test`
- ✅ Try example prompts in Claude Code
- ✅ Test all 4 strategies

### For Development
- 📋 Implement session management (stateful conversations)
- 📋 Add explicit multi-model workflows
- 📋 Performance optimization and caching
- 📋 Add more execution strategies

### For Production Use
- 🔐 Configure API keys in Crush
- 💰 Monitor costs with real model execution
- 📊 Track quality scores and iteration counts
- 🎯 Fine-tune strategy thresholds

---

## Resources

- **Testing Guide**: `TESTING.md` - Comprehensive testing instructions
- **Progress Tracker**: `PROGRESS.md` - Development history
- **Source Code**: `src/` - All implementation files
- **Linear Project**: https://linear.app/ceti-luxor/project/crush-mcp-server-fabcd9722fbc

---

## Quick Commands Reference

```bash
# Development
npm run build        # Compile TypeScript
npm run dev          # Watch mode (auto-rebuild)
npm test             # Run all tests
npm run test:watch   # Tests in watch mode
npm run test:ui      # Tests with UI

# Testing
npm test             # Unit tests (mocked)
node dist/index.js   # Manual server test

# Git
git status           # Check changes
git log --oneline    # View commits

# Rebuild after changes
npm run build && npm link
```

---

**Ready to go!** 🚀

Restart Claude Code and try:
```
Use crush_execute with fast strategy to say hello!
```
