# Crush CLI Reference

**Official Repository**: https://github.com/charmbracelet/crush
**Current Version**: v0.13.7 (installed locally)
**License**: FSL-1.1-MIT (MIT-compatible)
**Author**: Kujtim Hoxha / Charmbracelet

---

## What is Crush CLI?

Crush is **the glamourous AI coding agent for your favourite terminal** 💘

Unlike other CLI tools that rely solely on AI reasoning, Crush integrates **Language Server Protocol (LSP)** for real-time code intelligence from actual project files, providing better contextual understanding.

---

## Key Features

### 🎯 Multi-Model AI Support
Supports multiple AI providers:
- **OpenAI**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic**: Claude Sonnet 4.5, Claude Haiku, Claude Opus
- **Google**: Gemini Pro, Gemini Ultra
- **Groq**: Fast inference models
- **OpenRouter**: Free models (Qwen 3 Coder, etc.)
- **AWS Bedrock**: Claude via AWS
- **Azure OpenAI**: Enterprise deployments
- **Vertex AI**: Google Cloud AI
- **Local Engines**: Ollama, LM Studio (via OpenAI-compatible APIs)

**Model Switching**: Switch between models mid-session for different coding tasks

### 🔌 Model Context Protocol (MCP)
Three transport types:
- **stdio**: Command-line servers
- **http**: HTTP endpoints
- **sse**: Server-Sent Events

### 📡 LSP Enhancement
- Real-time code intelligence from actual project files
- Better contextual understanding than pure AI reasoning
- First-class integration with Language Server Protocol

### 🚀 Process Management
- Spawn and manage background jobs
- Spin up servers
- Run parallel builds
- Cross-platform support

### 🌍 Cross-Platform
First-class support on:
- macOS
- Linux
- Windows (PowerShell and WSL)
- FreeBSD
- OpenBSD
- NetBSD

---

## Installation

```bash
# Homebrew (macOS/Linux)
brew install charmbracelet/tap/crush

# Or download from releases
# https://github.com/charmbracelet/crush/releases
```

**Current Installation**:
```bash
$ which crush
/opt/homebrew/bin/crush

$ crush --version
crush version v0.13.7
```

---

## Configuration

**Config Location**: `~/.local/share/crush/crush.json`

Example configuration:
```json
{
  "providers": {
    "openai": {
      "api_key": "sk-..."
    },
    "anthropic": {
      "api_key": "sk-ant-..."
    },
    "groq": {
      "api_key": "gsk_..."
    }
  },
  "default_model": "claude-sonnet-4-5",
  "lsp": {
    "enabled": true
  },
  "mcp": {
    "servers": []
  }
}
```

---

## Usage Patterns

### Basic Prompt
```bash
crush "Explain this function"
crush "Refactor this code to use async/await"
```

### Multi-Model Workflow
```bash
# Fast iteration with Groq
crush --model groq "Generate test outline"

# Quality refinement with Claude
crush --model claude-sonnet-4-5 "Refine and add edge cases"
```

### With LSP Context
```bash
# Crush automatically uses LSP for project context
cd /path/to/project
crush "Find all usages of this function"
```

### Background Jobs
```bash
crush "Run tests in background" --background
crush jobs list
```

---

## MCP Integration

Crush CLI **natively supports MCP servers** via three transport types:

### stdio Transport
```json
{
  "mcp": {
    "servers": [
      {
        "name": "my-server",
        "command": "node",
        "args": ["/path/to/server.js"]
      }
    ]
  }
}
```

### HTTP Transport
```json
{
  "mcp": {
    "servers": [
      {
        "name": "api-server",
        "url": "http://localhost:3000/mcp"
      }
    ]
  }
}
```

### SSE Transport
```json
{
  "mcp": {
    "servers": [
      {
        "name": "sse-server",
        "url": "https://example.com/sse"
      }
    ]
  }
}
```

---

## Why This MCP Server?

### The Gap

While Crush CLI has MCP support, it doesn't expose its **multi-model orchestration capabilities** as an MCP server itself.

**What Crush offers**:
- ✅ Multi-model AI support (OpenAI, Anthropic, Groq, etc.)
- ✅ Model switching mid-session
- ✅ LSP integration for code context
- ✅ Can **consume** MCP servers

**What Crush doesn't offer**:
- ❌ Expose multi-model orchestration as an **MCP server**
- ❌ Programmable strategies (fast, balanced, quality, cost-optimized)
- ❌ Quality evaluation and iterative refinement
- ❌ Cost-aware execution with budget constraints

### The Solution: crush-mcp-server

**This project bridges the gap** by:

1. **Exposing Crush CLI's capabilities via MCP**
   - `crush_execute` tool for executing prompts
   - `crush_evaluate` tool for estimating cost/time/quality

2. **Adding Strategic Orchestration**
   - **Fast**: Single model, <10s, <$0.005
   - **Balanced**: Two models, <30s, ~$0.015
   - **Quality**: Multi-model iteration, <60s, ~$0.06
   - **Cost-Optimized**: Budget-constrained execution

3. **Enabling Meta-Orchestration**
   ```
   Claude Code → Crush MCP Server → Crush CLI → Multiple AI Models
   ```

4. **Quality Evaluation**
   - Automatic quality scoring (0-1 scale)
   - Iterative refinement until quality threshold met
   - Model selection based on quality goals

---

## Technical Architecture

### Crush CLI Internals
```
┌─────────────────────────────────────────────────────────────┐
│ Crush CLI (Go + Charm Stack)                                │
│                                                              │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│ │ LSP      │  │ Multi    │  │ MCP      │  │ Process  │    │
│ │ Client   │  │ Model    │  │ Consumer │  │ Manager  │    │
│ └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ TUI (Bubble Tea + Lip Gloss + Glamour)               │   │
│ └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### crush-mcp-server Architecture
```
┌─────────────────────────────────────────────────────────────┐
│ crush-mcp-server (TypeScript + MCP SDK)                     │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ MCP Server (stdio transport)                         │   │
│ │ - crush_execute tool                                 │   │
│ │ - crush_evaluate tool                                │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Orchestrator (Strategy Pattern)                      │   │
│ │ - Fast Strategy                                      │   │
│ │ - Balanced Strategy                                  │   │
│ │ - Quality Strategy                                   │   │
│ │ - Cost-Optimized Strategy                            │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Crush Client Wrapper                                 │   │
│ │ - Execute crush commands via child_process           │   │
│ │ - Parse JSON output                                  │   │
│ │ - Handle errors and retries                          │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Quality Evaluator                                    │   │
│ │ - Semantic coherence (0-1)                           │   │
│ │ - Completeness scoring                               │   │
│ │ - Error detection                                    │   │
│ └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │ Crush CLI Binary │
                    │ /opt/homebrew/   │
                    │ bin/crush        │
                    └──────────────────┘
                              ↓
          ┌──────────────────────────────────────┐
          │ Multiple AI Models                   │
          │ - OpenAI GPT-4                       │
          │ - Anthropic Claude                   │
          │ - Groq (fast inference)              │
          │ - OpenRouter (free models)           │
          └──────────────────────────────────────┘
```

---

## Development Context

### Charm Stack
Crush CLI is built with the **Charm stack**:
- **Bubble Tea**: TUI framework
- **Bubbles**: TUI components
- **Lip Gloss**: Styling
- **Glamour**: Markdown rendering

### Why TypeScript for MCP Server?
- **MCP SDK**: Official SDK is in TypeScript/Python
- **Ecosystem**: npm packages, type safety
- **Testing**: Vitest for comprehensive testing
- **Integration**: Easy integration with Node.js ecosystem

### Why Not Just Use Crush Directly?
1. **Programmatic Access**: MCP server enables programmatic orchestration
2. **Strategy Patterns**: Pre-defined execution strategies (fast, balanced, quality, cost-optimized)
3. **Quality Evaluation**: Automatic quality scoring and iterative refinement
4. **Meta-Orchestration**: Claude Code can orchestrate Crush CLI via MCP
5. **Cost Awareness**: Budget-constrained execution with cost estimation
6. **Testing**: Comprehensive test suite for reliability

---

## API Reference

### Crush CLI Commands (via child_process)

```bash
# Execute prompt with specific model
crush --model claude-sonnet-4-5 "prompt text"

# Execute with max tokens
crush --max-tokens 2000 "prompt text"

# Execute with temperature
crush --temperature 0.7 "prompt text"

# List available models
crush models list

# Check version
crush --version
```

### crush-mcp-server Tools

```typescript
// crush_execute tool
{
  prompt: string;           // User prompt
  strategy: 'fast' | 'balanced' | 'quality' | 'cost-optimized';
  max_cost?: number;        // Optional budget constraint
}

// Returns
{
  result: string;           // Final output
  metadata: {
    models_used: string[];  // Models invoked
    total_cost: number;     // Total cost in USD
    execution_time: number; // Time in seconds
    quality_score: number;  // Quality (0-1)
    strategy: string;       // Strategy used
  }
}
```

---

## Configuration Files

### Crush CLI Config
**Location**: `~/.local/share/crush/crush.json`

```json
{
  "providers": {
    "anthropic": {
      "api_key": "sk-ant-..."
    },
    "groq": {
      "api_key": "gsk_..."
    }
  },
  "default_model": "claude-sonnet-4-5"
}
```

### crush-mcp-server Config
**Location**: `~/.claude/settings.json` (MCP server declaration)

```json
{
  "mcp": {
    "servers": [
      {
        "name": "crush",
        "command": "node",
        "args": [
          "/Users/manu/Documents/LUXOR/crush-mcp-server/dist/index.js"
        ]
      }
    ]
  }
}
```

---

## Testing Strategy

### Unit Tests
```typescript
describe('Fast Strategy', () => {
  it('should execute with single model', async () => {
    const result = await fastStrategy.execute('test prompt');
    expect(result.metadata.models_used).toHaveLength(1);
    expect(result.metadata.total_cost).toBeLessThan(0.005);
  });
});
```

### Integration Tests
```bash
# Test with actual Crush CLI (requires API keys)
npm run test:integration

# Test with mocked Crush CLI (no API keys needed)
npm test
```

---

## Resources

- **Crush CLI GitHub**: https://github.com/charmbracelet/crush
- **Charm Blog**: https://charm.land/blog/crush-comes-home/
- **MCP Specification**: https://modelcontextprotocol.io
- **Charmbracelet**: https://github.com/charmbracelet

---

## Summary

| Aspect | Crush CLI | crush-mcp-server |
|--------|-----------|------------------|
| **Purpose** | AI coding agent for terminal | MCP server exposing Crush capabilities |
| **Interface** | Terminal TUI | MCP protocol (stdio) |
| **Multi-Model** | ✅ Native support | ✅ Via Crush CLI |
| **MCP Support** | ✅ Consumer (stdio/http/sse) | ✅ Provider (stdio) |
| **Strategies** | ❌ Manual model selection | ✅ 4 pre-defined strategies |
| **Quality Eval** | ❌ Manual assessment | ✅ Automatic scoring (0-1) |
| **Cost Control** | ❌ Manual monitoring | ✅ Budget constraints |
| **LSP** | ✅ Native support | 🔄 Via Crush CLI |
| **Language** | Go + Charm stack | TypeScript + MCP SDK |

**Together**: Claude Code → crush-mcp-server → Crush CLI → Multiple AI Models 🚀

---

*This reference documents the relationship between Crush CLI and crush-mcp-server, enabling developers to understand how the two projects complement each other.*
