# Crush MCP Server - Development Toolkit

**Project-specific Claude Code configuration for MCP server development with multi-model orchestration**

🔗 **GitHub**: https://github.com/manutej/crush-mcp-server
📦 **Package**: crush-mcp-server v0.1.0
🎯 **Mission**: Expose Crush CLI's multi-model orchestration capabilities via Model Context Protocol

---

## 🎯 Project Context

This MCP server provides intelligent model routing across multiple AI providers using 4 execution strategies:
- **Fast**: Single model, <10s, <$0.005 (grok-3-mini)
- **Balanced**: Two models, <30s, ~$0.015 (grok → haiku)
- **Quality**: Multi-model iteration, <60s, ~$0.06 (grok → sonnet → refinement)
- **Cost-Optimized**: Budget-constrained, customizable max cost

**Tech Stack**: TypeScript, Node.js, MCP SDK 0.5.0, Vitest, Crush CLI

---

## 📦 Development Toolkit Inventory

**Last Updated**: 2025-11-18

| Category | Count | Purpose |
|----------|-------|---------|
| **Skills** | 22 | Auto-loaded expertise for MCP, Go, TypeScript, Testing, API design |
| **Agents** | 11 | Specialized agents for research, testing, documentation, orchestration |
| **Commands** | 14 | Slash commands for MARS, MERCURIO, HEKAT, workflows |
| **Workflows** | 3 | Multi-agent orchestration patterns for MCP integration |

**Total Resources**: 50 specialized tools for MCP server development

---

## 🛠️ Available Skills (22)

### MCP Development (3)
- **mcp-integration-expert** - MCP architecture, server/client patterns, tool discovery
- **n8n-mcp-orchestrator** - Workflow automation integration patterns
- **supabase-mcp-integration** - Database-backed MCP server patterns

### Programming Languages (3)
- **golang-backend-development** - Go concurrency, servers, microservices
- **nodejs-development** - Node.js runtime, async patterns, npm ecosystem
- **typescript-fp** - Functional TypeScript patterns

### Testing Suite (5)
- **jest-react-testing** - Component testing, mocking strategies
- **pytest** - Python testing framework
- **pytest-patterns** - Advanced test patterns
- **shell-testing-framework** - Bash script testing
- **playwright-visual-testing** - Browser automation testing

### API Design (3)
- **api-gateway-patterns** - Kong, routing, rate limiting, authentication
- **rest-api-design-patterns** - RESTful API best practices
- **graphql-api-development** - GraphQL schema, resolvers, subscriptions

### Backend Frameworks (3)
- **fastapi** - Modern Python API development
- **fastapi-development** - Async patterns, Pydantic validation
- **fastapi-microservices-development** - Production microservices

### Infrastructure (1)
- **docker-compose-orchestration** - Multi-container applications

### AI/ML (1)
- **xai-grok-api-mastery** - xAI Grok API integration (used by Crush CLI)

### Functional Programming (3)
- **functional-programming** - Pure functions, immutability, composition
- **fp-ts** - Typed functional programming in TypeScript
- **category-master** - Category theory for rigorous reasoning

---

## 🤖 Available Agents (11)

### Research & Orchestration (2)
- **MARS** (Multi-Agent Research Synthesis) - Systems-level intelligence for complex operations
- **MERCURIO** (Mixture of Experts) - Multi-perspective analysis with mental/physical/spiritual planes

### MCP Expertise (2)
- **mcp-integration-wizard** - MCP server/client implementation, tool discovery, security
- **linear-mcp-orchestrator** - Linear project management integration through MCP

### Development (5)
- **test-engineer** - Comprehensive test suite creation (unit, integration, e2e)
- **test-runner** - Test execution and validation
- **docs-generator** - API documentation, JSDoc, user guides
- **api-architect** - RESTful API design, database schemas, OpenAPI specs
- **frontend-architect** - React/TypeScript component architecture

### Support (2)
- **practical-programmer** - Pragmatic problem-solving, clean code, maintainability
- **deep-researcher** - In-depth technical research and documentation

---

## 📋 Available Commands (14)

### Orchestration (5)
- **/hekat** - L1-L7 complexity-aware orchestration builder
- **/hekat-exit** - Exit HEKAT persistent mode
- **/mars** - Multi-Agent Research Synthesis for systems-level challenges
- **/mercurio** - Mixture of Experts analysis for complex decisions
- **/workflows** - List and execute multi-agent workflows

### Reasoning (2)
- **/think** - Sequential thinking MCP with formatted output
- **/sequential-thinking** - Extended reasoning and systematic problem-solving

### Utilities (3)
- **/ctx7** - Context7 library documentation lookup
- **/crew** - Agent discovery and management
- **/agent** - Agent creation and configuration

### Meta Commands (4)
- **/agentinfo** - Agent information and capabilities
- **/meta-agent** - Meta-agent generation
- **/meta-command** - Meta-command creation
- **/meta-skill-builder** - Build multiple skills in parallel

---

## 🔄 Available Workflows (3)

### API Development
**File**: `api-development.yaml`
**Purpose**: Complete API development lifecycle from design to deployment
**Agents**: api-architect → test-engineer → docs-generator

### MCP Integration Complete
**File**: `mcp-integration-complete.yaml`
**Purpose**: End-to-end MCP server integration with research, implementation, testing
**Agents**: mcp-integration-wizard → deep-researcher → test-engineer

### Research to Documentation
**File**: `research-to-documentation.yaml`
**Purpose**: Transform research findings into comprehensive documentation
**Agents**: deep-researcher → docs-generator

---

## 🚀 Quick Start for Contributors

### Essential Commands
```bash
# Initialize development environment
npm install && npm run build

# Run tests with coverage
npm run test:coverage

# Run specific workflow
/workflows                        # List available workflows
/workflows mcp-integration-complete  # Execute MCP integration workflow

# Get library documentation
/ctx7 @modelcontextprotocol/sdk   # Lookup MCP SDK docs

# Orchestrate complex tasks
/mars                             # Systems-level research synthesis
/mercurio                         # Multi-expert analysis
/hekat                            # Complexity-aware orchestration
```

### Common Development Patterns

**Research MCP SDK Features**:
```
/ctx7 @modelcontextprotocol/sdk
Use deep-researcher agent to analyze MCP protocol specification
```

**Design New Strategy**:
```
Use api-architect agent to design new execution strategy
/think to reason through strategy tradeoffs
Use test-engineer agent to write comprehensive tests
```

**Add New Model Provider**:
```
/mars to research provider API, design integration, test, document
Use xai-grok-api-mastery skill for Grok-specific patterns
Use golang-backend-development if provider requires Go SDK
```

---

## 🧪 Testing Philosophy

**TDD Approach** (Test-Driven Development):
1. **Write tests first** using test-engineer agent
2. **Implement feature** with practical-programmer mindset
3. **Run tests** (`npm test`)
4. **Refine** until all tests pass
5. **Document** with docs-generator agent

**Current Coverage**: 12/12 tests passing ✅

---

## 📚 Documentation Standards

All new features must include:
- ✅ **JSDoc comments** for functions and classes
- ✅ **Test coverage** (aim for >80%)
- ✅ **README updates** for user-facing changes
- ✅ **PROGRESS.md** updates for development history
- ✅ **TypeScript types** (strict mode enabled)

Use **docs-generator** agent to ensure consistent documentation quality.

---

## 🎯 Architecture Patterns

### Strategy Pattern (Core)
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

**Skills Applied**:
- `typescript-fp` for functional patterns
- `api-gateway-patterns` for routing
- `functional-programming` for composition

### MCP Server Pattern
```typescript
const server = new Server({
  name: "crush-mcp-server",
  version: "0.1.0"
}, {
  capabilities: {
    tools: {}
  }
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Tool implementation
});
```

**Skills Applied**:
- `mcp-integration-expert` for protocol compliance
- `nodejs-development` for async patterns

---

## 🔗 Integration Points

### Crush CLI
**Location**: `/opt/homebrew/bin/crush`
**Config**: `~/.local/share/crush/crush.json`
**Skill**: `xai-grok-api-mastery`

### MCP SDK
**Package**: `@modelcontextprotocol/sdk@0.5.0`
**Docs**: `/ctx7 @modelcontextprotocol/sdk`
**Skill**: `mcp-integration-expert`

### Testing Framework
**Package**: `vitest@4.0.6`
**Skill**: `jest-react-testing` (similar patterns)

---

## 🎓 Learning Resources

### MCP Development
- **Skill**: Load `mcp-integration-expert` for comprehensive MCP knowledge
- **Command**: `/ctx7 @modelcontextprotocol/sdk` for up-to-date docs
- **Agent**: Use `mcp-integration-wizard` for integration guidance

### Multi-Model Orchestration
- **Skill**: `xai-grok-api-mastery` for Grok API patterns
- **Agent**: `MARS` for systems-level orchestration research
- **Command**: `/mars` to orchestrate multi-domain research

### TypeScript Best Practices
- **Skills**: `typescript-fp`, `functional-programming`, `nodejs-development`
- **Agent**: `practical-programmer` for pragmatic patterns
- **Agent**: `frontend-architect` for TypeScript architecture

---

## 🔮 Roadmap Integration

### Planned Features (See Linear)
- **Session Management** (CET-266) - Use `api-architect` + `test-engineer`
- **Explicit Multi-Model** (CET-265) - Research with `/mars`
- **Performance Optimization** (CET-271) - Use `practical-programmer` agent
- **Enhanced Documentation** (CET-269) - Use `docs-generator` agent

**Workflow**: `/workflows mcp-integration-complete` for new features

---

## 🤝 Contribution Workflow

1. **Research** - Use `/ctx7`, `deep-researcher`, or `/mars` for background
2. **Design** - Use `api-architect` or `/think` for architecture
3. **Plan** - Use `/hekat` for complexity-aware task breakdown
4. **Test First** - Use `test-engineer` to write comprehensive tests
5. **Implement** - Apply `practical-programmer` principles
6. **Document** - Use `docs-generator` for docs
7. **Review** - Use `/mercurio` for multi-perspective validation

---

## 📖 Further Reading

**Local Documentation**:
- `README.md` - Project overview and quick start
- `QUICKSTART.md` - Get started in 5 minutes
- `TESTING.md` - Comprehensive testing guide
- `PROGRESS.md` - Development history and roadmap

**Skills Usage**:
- Skills auto-load when relevant (progressive disclosure)
- Explicitly invoke with: `Use <skill-name> skill to...`
- List all: Check `.claude/skills/` directory

**Agent Usage**:
- Task tool with specific agent types
- Example: `Use test-engineer agent to create comprehensive test suite`

---

## 🎯 Project Goals

**Primary**:
- ✅ Expose Crush CLI via MCP protocol
- ✅ Implement 4 execution strategies (fast, balanced, quality, cost-optimized)
- ✅ Achieve comprehensive test coverage (12/12 tests passing)
- ✅ Enable meta-orchestration (Claude Code → MCP → Crush → Multiple AI Models)

**Secondary**:
- 🔄 Integration testing with Claude Code
- 📋 Session management for multi-turn conversations
- 📋 Explicit multi-model workflows
- 📋 Performance optimization and caching

---

## 🏗️ Project Structure

```
crush-mcp-server/
├── .claude/                    # This toolkit
│   ├── CLAUDE.md              # This file
│   ├── skills/                # 22 auto-loaded skills
│   ├── agents/                # 11 specialized agents
│   ├── commands/              # 14 slash commands
│   └── workflows/             # 3 orchestration patterns
├── src/
│   ├── index.ts               # MCP server (stdio transport)
│   ├── orchestrator.ts        # Strategy orchestration
│   ├── crush-client.ts        # Crush CLI wrapper
│   ├── evaluator.ts           # Quality evaluation
│   ├── types.ts               # TypeScript definitions
│   └── strategies/
│       ├── base.ts            # Strategy interface
│       ├── fast.ts            # Single model
│       ├── balanced.ts        # Two models
│       ├── quality.ts         # Multi-model + iteration
│       └── cost-optimized.ts  # Budget-constrained
├── tests/
│   └── strategies.test.ts     # 12 comprehensive tests
├── dist/                      # Compiled JavaScript
├── docs/                      # Additional documentation
├── README.md                  # User-facing overview
├── QUICKSTART.md              # 5-minute setup guide
├── TESTING.md                 # Testing documentation
└── PROGRESS.md                # Development tracker
```

---

## 🎨 Code Style

- **TypeScript**: Strict mode enabled
- **Target**: ES2022
- **Modules**: Node16
- **Comments**: Comprehensive JSDoc
- **Approach**: TDD (tests first)
- **Philosophy**: Pragmatic Programmer principles

**Enforce with**: `practical-programmer` agent guidance

---

## 🚨 Key Principles

1. **Test-Driven Development** - Write tests before code
2. **Progressive Disclosure** - Skills auto-load when needed
3. **Meta-Orchestration** - Use agents to build agents
4. **Documentation-First** - Document as you develop
5. **Functional Patterns** - Leverage fp-ts, immutability, composition
6. **Strategic Execution** - Match strategy to task complexity (/hekat)

---

## 📞 Quick Reference

**Need help with...**

| Task | Use |
|------|-----|
| MCP protocol | `mcp-integration-expert` skill + `/ctx7 @modelcontextprotocol/sdk` |
| Testing | `test-engineer` agent + `jest-react-testing` skill |
| API design | `api-architect` agent + `rest-api-design-patterns` skill |
| Documentation | `docs-generator` agent |
| Complex research | `/mars` or `MARS` agent |
| Decision analysis | `/mercurio` or `MERCURIO` agent |
| Task breakdown | `/hekat` for L1-L7 orchestration |
| Library docs | `/ctx7 <library-name>` |
| Sequential reasoning | `/think` |

---

**Status**: ✅ Ready for collaborative MCP server development
**Toolkit**: 50 specialized resources (22 skills + 11 agents + 14 commands + 3 workflows)
**Philosophy**: Test-driven, pragmatic, meta-orchestrated development

---

*This toolkit enables rapid, high-quality MCP server development with intelligent assistance at every stage. Skills auto-load when relevant. Agents provide specialized expertise. Commands orchestrate complex workflows. Workflows coordinate multi-agent operations.*

**Let's build something amazing! 🚀**
