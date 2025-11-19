# MCP Server Creation Guide

**Complete guide to creating Model Context Protocol servers from scratch**

Based on the experience of building `crush-mcp-server` - a production-ready MCP server exposing Crush CLI multi-model orchestration capabilities.

---

## Table of Contents

1. [Understanding MCP](#understanding-mcp)
2. [Project Setup](#project-setup)
3. [Core Implementation](#core-implementation)
4. [Testing Strategy](#testing-strategy)
5. [Documentation](#documentation)
6. [Deployment](#deployment)
7. [Best Practices](#best-practices)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)

---

## Understanding MCP

### What is MCP?

**Model Context Protocol** (MCP) is an open protocol that enables AI applications to securely access external data sources and tools.

**Key Concepts**:
- **Servers**: Expose tools, resources, and prompts
- **Clients**: Consume MCP capabilities (e.g., Claude Code)
- **Transports**: Communication channels (stdio, http, sse)
- **Tools**: Functions the AI can invoke
- **Resources**: Data the AI can access
- **Prompts**: Templated interactions

### Why Create an MCP Server?

**Scenarios**:
1. **Expose CLI tools** to AI agents (like Crush CLI → crush-mcp-server)
2. **Integrate APIs** with AI workflows
3. **Provide specialized knowledge** or data sources
4. **Orchestrate complex operations** via AI

**Benefits**:
- ✅ **Programmatic access** to existing tools
- ✅ **AI-driven workflows** with type safety
- ✅ **Reusability** across MCP clients
- ✅ **Standardized interface** (MCP protocol)

---

## Project Setup

### 1. Technology Stack Selection

**For TypeScript/Node.js** (recommended for MCP):
```bash
npm init -y
npm install @modelcontextprotocol/sdk
npm install --save-dev typescript @types/node vitest
```

**Project Structure**:
```
my-mcp-server/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── tools/                # Tool implementations
│   ├── resources/            # Resource providers
│   └── types.ts              # TypeScript types
├── tests/
│   └── *.test.ts             # Unit tests
├── dist/                     # Compiled output
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### 2. TypeScript Configuration

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 3. Package.json Setup

**package.json**:
```json
{
  "name": "my-mcp-server",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "my-mcp-server": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "vitest": "^4.0.6"
  }
}
```

---

## Core Implementation

### 1. Basic MCP Server

**src/index.ts**:
```typescript
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Create server
const server = new Server(
  {
    name: "my-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "my_tool",
        description: "Description of what this tool does",
        inputSchema: {
          type: "object",
          properties: {
            param1: {
              type: "string",
              description: "Description of param1",
            },
          },
          required: ["param1"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "my_tool") {
    const result = await myToolImplementation(args.param1);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function myToolImplementation(param: string): Promise<any> {
  // Your tool logic here
  return { result: `Processed: ${param}` };
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("My MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
```

### 2. Tool Implementation Pattern

**src/tools/example-tool.ts**:
```typescript
export interface ToolInput {
  param1: string;
  param2?: number;
}

export interface ToolOutput {
  result: string;
  metadata: {
    timestamp: string;
    version: string;
  };
}

export class ExampleTool {
  async execute(input: ToolInput): Promise<ToolOutput> {
    // Validate input
    if (!input.param1) {
      throw new Error("param1 is required");
    }

    // Execute logic
    const result = await this.processInput(input);

    // Return structured output
    return {
      result,
      metadata: {
        timestamp: new Date().toISOString(),
        version: "0.1.0",
      },
    };
  }

  private async processInput(input: ToolInput): Promise<string> {
    // Your implementation here
    return `Processed: ${input.param1}`;
  }
}
```

### 3. Strategy Pattern (Advanced)

**For crush-mcp-server**, we used the Strategy Pattern for different execution modes:

**src/strategies/base.ts**:
```typescript
export interface Strategy {
  execute(prompt: string, maxCost?: number): Promise<ExecuteResult>;
}

export interface ExecuteResult {
  result: string;
  metadata: {
    models_used: string[];
    total_cost: number;
    execution_time: number;
    quality_score: number;
    strategy: string;
  };
}
```

**src/strategies/fast.ts**:
```typescript
import { Strategy, ExecuteResult } from './base.js';

export class FastStrategy implements Strategy {
  async execute(prompt: string): Promise<ExecuteResult> {
    // Single model, fast execution
    const result = await this.runModel('grok-3-mini', prompt);

    return {
      result: result.output,
      metadata: {
        models_used: ['grok-3-mini'],
        total_cost: result.cost,
        execution_time: result.time,
        quality_score: 0.6,
        strategy: 'fast',
      },
    };
  }

  private async runModel(model: string, prompt: string) {
    // Implementation
  }
}
```

**src/orchestrator.ts**:
```typescript
import { Strategy, ExecuteResult } from './strategies/base.js';
import { FastStrategy } from './strategies/fast.js';
import { BalancedStrategy } from './strategies/balanced.js';
import { QualityStrategy } from './strategies/quality.js';

export class Orchestrator {
  private strategies: Map<string, Strategy>;

  constructor() {
    this.strategies = new Map([
      ['fast', new FastStrategy()],
      ['balanced', new BalancedStrategy()],
      ['quality', new QualityStrategy()],
    ]);
  }

  async execute(strategy: string, prompt: string, maxCost?: number): Promise<ExecuteResult> {
    const strategyImpl = this.strategies.get(strategy);
    if (!strategyImpl) {
      throw new Error(`Unknown strategy: ${strategy}`);
    }

    return await strategyImpl.execute(prompt, maxCost);
  }
}
```

---

## Testing Strategy

### 1. Unit Tests with Vitest

**vitest.config.ts**:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['dist/', 'node_modules/', 'tests/'],
    },
  },
});
```

**tests/strategies.test.ts**:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { FastStrategy } from '../src/strategies/fast.js';

describe('FastStrategy', () => {
  let strategy: FastStrategy;

  beforeEach(() => {
    strategy = new FastStrategy();
  });

  it('should execute with single model', async () => {
    const result = await strategy.execute('test prompt');

    expect(result.metadata.models_used).toHaveLength(1);
    expect(result.metadata.models_used[0]).toBe('grok-3-mini');
  });

  it('should complete in under 10 seconds', async () => {
    const result = await strategy.execute('test prompt');

    expect(result.metadata.execution_time).toBeLessThan(10);
  });

  it('should cost less than $0.005', async () => {
    const result = await strategy.execute('test prompt');

    expect(result.metadata.total_cost).toBeLessThan(0.005);
  });

  it('should return quality score around 0.6', async () => {
    const result = await strategy.execute('test prompt');

    expect(result.metadata.quality_score).toBeCloseTo(0.6, 1);
  });
});
```

### 2. Test-Driven Development (TDD)

**Workflow**:
1. **Write test first** (red phase)
2. **Implement minimal code** to pass (green phase)
3. **Refactor** while keeping tests green
4. **Repeat**

**Example**:
```typescript
// 1. Write failing test
it('should validate input parameters', async () => {
  await expect(strategy.execute('')).rejects.toThrow('Prompt cannot be empty');
});

// 2. Implement validation
async execute(prompt: string): Promise<ExecuteResult> {
  if (!prompt || prompt.trim() === '') {
    throw new Error('Prompt cannot be empty');
  }
  // ... rest of implementation
}

// 3. Test passes ✅
```

---

## Documentation

### 1. README.md Structure

```markdown
# Project Name

Brief description

## Features
- Feature 1
- Feature 2

## Quick Start
Installation and basic usage

## Architecture
High-level design

## Documentation
Links to detailed docs

## Contributing
Development workflow

## License
```

### 2. QUICKSTART.md

**5-minute setup guide**:
1. Prerequisites
2. Installation steps (copy-paste commands)
3. Test it (with example)
4. Next steps

### 3. API Documentation

**src/index.ts** (JSDoc):
```typescript
/**
 * Executes a prompt using the specified strategy
 *
 * @param strategy - Execution strategy: 'fast' | 'balanced' | 'quality' | 'cost-optimized'
 * @param prompt - User prompt to execute
 * @param maxCost - Optional maximum cost in USD
 * @returns ExecuteResult with output and metadata
 *
 * @example
 * ```typescript
 * const result = await orchestrator.execute('fast', 'Explain REST APIs');
 * console.log(result.result);
 * ```
 */
async execute(
  strategy: string,
  prompt: string,
  maxCost?: number
): Promise<ExecuteResult>
```

---

## Deployment

### 1. Claude Code Integration

**~/.claude/settings.json**:
```json
{
  "mcp": {
    "servers": [
      {
        "name": "my-server",
        "description": "My MCP server description",
        "command": "node",
        "args": [
          "/path/to/my-mcp-server/dist/index.js"
        ]
      }
    ]
  }
}
```

### 2. npm Package Publishing

```bash
# Build
npm run build

# Test
npm test

# Publish
npm publish
```

**package.json** (for publishing):
```json
{
  "files": [
    "dist/**/*",
    "README.md",
    "LICENSE"
  ],
  "keywords": [
    "mcp",
    "model-context-protocol",
    "ai",
    "claude"
  ]
}
```

### 3. GitHub Release

```bash
# Tag release
git tag -a v0.1.0 -m "Initial release"
git push origin v0.1.0

# Create GitHub release
gh release create v0.1.0 --title "v0.1.0" --notes "Initial release"
```

---

## Best Practices

### 1. Error Handling

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    // Validate
    if (!name) {
      throw new Error("Tool name is required");
    }

    // Execute
    const result = await executeTool(name, args);

    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  } catch (error) {
    // Log error
    console.error("Tool execution error:", error);

    // Return user-friendly error
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
      isError: true,
    };
  }
});
```

### 2. Input Validation

```typescript
function validateInput(args: any): asserts args is ToolInput {
  if (typeof args.param1 !== 'string') {
    throw new Error('param1 must be a string');
  }

  if (args.param2 !== undefined && typeof args.param2 !== 'number') {
    throw new Error('param2 must be a number');
  }
}
```

### 3. Type Safety

```typescript
// Define strict types
interface ToolInput {
  param1: string;
  param2?: number;
}

interface ToolOutput {
  result: string;
  metadata: Record<string, any>;
}

// Use TypeScript's type guards
function isToolInput(args: any): args is ToolInput {
  return typeof args.param1 === 'string';
}
```

### 4. Logging

```typescript
// Use stderr for logs (stdout is for MCP protocol)
console.error(`[INFO] ${new Date().toISOString()} - Server started`);
console.error(`[DEBUG] Tool called: ${name}`);
console.error(`[ERROR] Execution failed: ${error.message}`);
```

---

## Common Patterns

### 1. CLI Tool Wrapper

**Pattern**: Wrap existing CLI tools (like Crush) via child_process

**src/cli-wrapper.ts**:
```typescript
import { spawn } from 'child_process';

export class CLIWrapper {
  constructor(private binaryPath: string) {}

  async execute(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn(this.binaryPath, args);

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Process exited with code ${code}: ${stderr}`));
        }
      });
    });
  }
}
```

### 2. API Integration

**Pattern**: Wrap REST APIs with MCP tools

**src/api-client.ts**:
```typescript
export class APIClient {
  constructor(private baseURL: string, private apiKey: string) {}

  async request(endpoint: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  }
}
```

### 3. Resource Providers

**Pattern**: Provide data sources to AI

```typescript
import { ListResourcesRequestSchema, ReadResourceRequestSchema } from "@modelcontextprotocol/sdk/types.js";

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "docs://my-docs",
        name: "My Documentation",
        description: "Project documentation",
        mimeType: "text/markdown",
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === "docs://my-docs") {
    const content = await loadDocumentation();
    return {
      contents: [
        {
          uri,
          mimeType: "text/markdown",
          text: content,
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});
```

---

## Troubleshooting

### Common Issues

**1. "Server not responding"**
```bash
# Check if server is running
ps aux | grep my-mcp-server

# Check logs
tail -f ~/.claude/mcp-logs/my-server.log

# Test server manually
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/index.js
```

**2. "Tool not found"**
- Verify tool name in `ListToolsRequestSchema` handler
- Check `CallToolRequestSchema` handler has matching case
- Restart Claude Code to reload server

**3. "Type errors in TypeScript"**
```bash
# Clean build
rm -rf dist/
npm run build

# Check types
npx tsc --noEmit
```

**4. "Tests failing"**
```bash
# Run tests with verbose output
npm test -- --reporter=verbose

# Run specific test
npm test -- tests/strategies.test.ts

# Check coverage
npm run test:coverage
```

---

## Checklist for New MCP Server

✅ **Project Setup**
- [ ] Initialize npm project
- [ ] Install MCP SDK and dependencies
- [ ] Configure TypeScript (strict mode)
- [ ] Set up testing framework (Vitest)
- [ ] Create project structure (src/, tests/, dist/)

✅ **Core Implementation**
- [ ] Create MCP server with stdio transport
- [ ] Implement ListToolsRequestSchema handler
- [ ] Implement CallToolRequestSchema handler
- [ ] Add error handling
- [ ] Add input validation
- [ ] Add TypeScript types

✅ **Testing**
- [ ] Write unit tests for each tool
- [ ] Achieve >80% code coverage
- [ ] Test error cases
- [ ] Test edge cases

✅ **Documentation**
- [ ] Write README.md
- [ ] Write QUICKSTART.md
- [ ] Add JSDoc comments
- [ ] Document architecture
- [ ] Add usage examples

✅ **Deployment**
- [ ] Build project (npm run build)
- [ ] Test with Claude Code
- [ ] Create GitHub repository
- [ ] Add LICENSE
- [ ] Tag release (v0.1.0)

✅ **Optional**
- [ ] Publish to npm
- [ ] Add CI/CD (GitHub Actions)
- [ ] Create demo video
- [ ] Write blog post

---

## Resources

- **MCP Specification**: https://modelcontextprotocol.io
- **MCP SDK Documentation**: https://github.com/modelcontextprotocol/sdk
- **crush-mcp-server Example**: https://github.com/manutej/crush-mcp-server
- **Crush CLI**: https://github.com/charmbracelet/crush

---

## Conclusion

Creating an MCP server enables AI agents to access your tools, APIs, and data sources through a standardized protocol. Follow this guide to:

1. ✅ Set up project with proper TypeScript configuration
2. ✅ Implement MCP server with tools and resources
3. ✅ Write comprehensive tests (TDD approach)
4. ✅ Document thoroughly (README, QUICKSTART, JSDoc)
5. ✅ Deploy to Claude Code and beyond

**Key Principles**:
- **Type Safety**: Use TypeScript strict mode
- **Error Handling**: Validate inputs, catch errors
- **Testing**: TDD with >80% coverage
- **Documentation**: Clear, comprehensive, with examples
- **Standards**: Follow MCP specification

---

*This guide was created based on the real-world experience of building crush-mcp-server, a production-ready MCP server that exposes Crush CLI's multi-model orchestration capabilities.*

**Happy MCP server building! 🚀**
