# Crush MCP Server

**Multi-model AI orchestration through Model Context Protocol**

Transform Crush CLI into an intelligent MCP tool for Claude Code, enabling meta-orchestration across multiple AI models with automatic strategy selection.

[![Tests](https://img.shields.io/badge/tests-12%2F12%20passing-brightgreen)]() [![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)]() [![MCP](https://img.shields.io/badge/MCP-0.5.0-purple)]()

---

## What is This?

An MCP server that exposes Crush CLI's multi-model orchestration capabilities to Claude Code and other MCP clients. Choose from 4 execution strategies based on your speed, cost, and quality needs.

```
Claude Code → Crush MCP Server → Crush CLI → Multiple AI Models
                   ↑
           (This Project)
```

---

## Features

✨ **4 Execution Strategies**
- **Fast**: Single model, <10s, <$0.005 (grok-3-mini)
- **Balanced**: Two models, <30s, ~$0.015 (grok → haiku)
- **Quality**: Multi-model with iteration, <60s, ~$0.06 (grok → sonnet → refinement)
- **Cost-Optimized**: Budget-constrained, customizable max cost

🎯 **MCP Tools**
- `crush_execute` - Execute prompts with intelligent model routing
- `crush_evaluate` - Estimate cost/time/quality before execution

🧪 **Fully Tested**
- 12/12 unit tests passing
- Comprehensive strategy coverage
- TDD approach with Vitest

---

## Quick Start

### Install (2 minutes)

```bash
cd /Users/manu/Documents/LUXOR/crush-mcp-server
npm install
npm run build
npm link
```

### Add to Claude Code

**Already configured!** ✅ Added to `~/.claude/settings.json`

**Next step**: Restart Claude Code to load the server.

### Test It

```
Use crush_execute with fast strategy to explain REST APIs in 2 sentences.
```

**📖 Full guide**: See [QUICKSTART.md](QUICKSTART.md)

---

## Architecture

### Strategy Pattern

```typescript
interface Strategy {
  execute(prompt: string, maxCost?: number): Promise<ExecuteResult>;
}

class Orchestrator {
  private strategies: Map<string, Strategy>;

  async execute(request: ExecuteRequest): Promise<ExecuteResult> {
    const strategy = this.strategies.get(request.strategy || 'balanced');
    return await strategy.execute(request.prompt, request.max_cost);
  }
}
```

### Execution Flow

```
┌──────────────────────────────────────────────────────────────┐
│ 1. User Prompt → Claude Code                                │
│    "Design a REST API using quality strategy"               │
└────────────────────┬─────────────────────────────────────────┘
                     │ MCP Protocol
┌────────────────────▼─────────────────────────────────────────┐
│ 2. Crush MCP Server (This Project)                          │
│    - Parse strategy from request                            │
│    - Route to appropriate Strategy implementation           │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────┐
│ 3. Quality Strategy                                          │
│    Step 1: grok-3-mini (outline)        → Cost: $0.002      │
│    Step 2: claude-sonnet-4-5 (detail)   → Cost: $0.045      │
│    Step 3: iterative refinement         → Cost: $0.016      │
│                                                              │
│    Quality Score: 0.87 (target: 0.75)                       │
│    Total Cost: $0.063                                        │
│    Execution Time: 42s                                       │
└────────────────────┬─────────────────────────────────────────┘
                     │ Formatted Response
┌────────────────────▼─────────────────────────────────────────┐
│ 4. Return to User via Claude Code                           │
│    {                                                         │
│      result: "...",                                          │
│      metadata: {                                             │
│        models_used: ["grok-3-mini", "claude-sonnet-4-5"],   │
│        total_cost: 0.063,                                    │
│        quality_score: 0.87,                                  │
│        strategy: "quality"                                   │
│      }                                                       │
│    }                                                         │
└──────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
crush-mcp-server/
├── src/
│   ├── index.ts              # MCP server (stdio transport)
│   ├── orchestrator.ts       # Strategy orchestration
│   ├── crush-client.ts       # Crush CLI wrapper
│   ├── evaluator.ts          # Quality evaluation (0-1 scale)
│   ├── types.ts              # TypeScript definitions
│   └── strategies/
│       ├── base.ts           # Strategy interface
│       ├── fast.ts           # Single model (grok-3-mini)
│       ├── balanced.ts       # Two models (grok → haiku)
│       ├── quality.ts        # Multi-model + iteration
│       └── cost-optimized.ts # Budget-constrained
├── tests/
│   └── strategies.test.ts    # 12 comprehensive tests
├── dist/                     # Compiled JavaScript
├── QUICKSTART.md             # Get started in 5 minutes
├── TESTING.md                # Comprehensive testing guide
├── PROGRESS.md               # Development tracker
└── package.json
```

---

## Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes ⚡
- **[TESTING.md](TESTING.md)** - Full testing guide with troubleshooting
- **[PROGRESS.md](PROGRESS.md)** - Development history and roadmap

---

## Development

### Run Tests

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:ui          # Visual UI
npm run test:coverage    # Coverage report
```

**Current**: ✅ 12/12 tests passing

### Build

```bash
npm run build     # Compile TypeScript
npm run dev       # Watch mode (auto-rebuild)
npm start         # Run compiled server
```

### Workflow

1. **Write tests first** (TDD approach)
2. **Implement strategy**
3. **Run tests** (`npm test`)
4. **Build** (`npm run build`)
5. **Test in Claude Code**

---

## Strategy Details

### Fast Strategy
```typescript
// Single model, minimal tokens
const result = await client.run({
  model: 'grok-3-mini',
  prompt: userPrompt,
  maxTokens: 2000
});
// Target: <10s, <$0.005, quality: 0.6
```

### Balanced Strategy
```typescript
// Step 1: Fast outline
const outline = await client.run({model: 'grok-3-mini', prompt});

// Step 2: Quality refinement with context
const refined = await client.run({
  model: 'claude-haiku-4-5',
  prompt: `Refine: ${outline.output}`
});
// Target: <30s, ~$0.015, quality: >0.5
```

### Quality Strategy
```typescript
// Step 1: Outline (grok)
// Step 2: Detailed analysis (sonnet)
// Step 3: Iterative refinement until quality >= 0.75
while (qualityScore < 0.75 && iterations < maxIterations) {
  const improvement = await refine(currentOutput);
  qualityScore = evaluator.evaluate(improvement);
}
// Target: <60s, ~$0.06, quality: >0.7
```

### Cost-Optimized Strategy
```typescript
// Calculate max tokens from budget
const maxTokens = Math.min(
  Math.floor((budget / costPerMToken) * 1_000_000 / 2),
  1000
);

const result = await client.run({
  model: 'grok-3-mini',
  prompt,
  maxTokens
});
// Target: Custom budget, quality: 0.5
```

---

## Configuration

### Crush Binary Path

Default: `/opt/homebrew/bin/crush`

To customize, edit `src/orchestrator.ts`:
```typescript
constructor(crushBinaryPath: string = '/your/custom/path/to/crush') {
```

### API Keys (for real execution)

Configure in `~/.local/share/crush/crush.json`:
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

---

## Roadmap

### ✅ Complete (v0.1.0)
- 4 execution strategies
- MCP server implementation
- Comprehensive test suite
- Quality evaluation system
- TypeScript build system

### 🔄 In Progress
- Claude Code integration testing
- Real-world usage validation

### 📋 Planned
- **Session Management** (CET-266) - Stateful multi-turn conversations
- **Explicit Multi-Model** (CET-265) - User-defined model workflows
- **Performance Optimization** (CET-271) - Caching and response time
- **Enhanced Documentation** (CET-269) - API reference and examples

See [Linear Project](https://linear.app/ceti-luxor/project/crush-mcp-server-fabcd9722fbc) for details.

---

## Contributing

### Development Workflow

1. **Create branch**: `git checkout -b feature/your-feature`
2. **Write tests**: Add to `tests/strategies.test.ts`
3. **Implement**: Add code to `src/`
4. **Test**: `npm test` (must pass)
5. **Build**: `npm run build`
6. **Update docs**: Update PROGRESS.md
7. **Commit**: `git commit -m "feat: description"`

### Code Style

- TypeScript strict mode
- ES2022 target
- Node16 modules
- Comprehensive JSDoc comments
- TDD approach (tests first)

---

## License

MIT

---

## Links

- **Linear Project**: https://linear.app/ceti-luxor/project/crush-mcp-server-fabcd9722fbc
- **Crush CLI**: https://github.com/charmbracelet/crush
- **MCP Specification**: https://modelcontextprotocol.io

---

**Status**: ✅ Production ready for testing | 🧪 Integration testing in progress

**Next**: Restart Claude Code and try it! See [QUICKSTART.md](QUICKSTART.md)
