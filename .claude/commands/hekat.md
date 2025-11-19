---
name: hekat
description: HEKAT Query Builder - complexity-aware orchestration (L1-L7)
---

# /hekat Command

## 🎯 Quick Start: Persistent Mode

```
/hekat                      # Activate HEKAT mode (persistent session)
<any query>                 # Automatically classified L1-L7
/hekat-exit                 # Deactivate mode and return to normal
```

## Mode vs Single Query

**HEKAT MODE (Recommended)**:
- Activate once with `/hekat`
- All subsequent queries are classified automatically
- Persistent throughout entire session
- See complexity level for each query automatically

**Single Query**:
- Use `/hekat <query>` to classify single query
- Immediate result, mode not activated
- Good for quick checks

## Usage

```
ACTIVATE MODE:
/hekat                      # Start persistent hekat mode
/hekat --activate          # Explicit activation

PROCESS QUERIES (while in mode):
Just type your query normally:
  "explain JWT"
  "design auth system"
  "build microservices"
  etc.

DISABLE MODE:
/hekat-exit                 # Deactivate mode
/hekat --deactivate        # Explicit deactivation

SINGLE QUERY (without mode):
/hekat "your query"         # Auto-detect complexity once
/hekat @L5 "your query"    # Force level (L1-L7) once
/hekat --verbose "query"   # Show token tracking once
/hekat --help              # Show hotkeys
```

## Mode Behavior

When HEKAT mode is **ACTIVE**:
- ✅ All queries automatically classified to L1-L7
- ✅ Hotkey suggestions shown for each query
- ✅ Token budget estimated automatically
- ✅ Complexity level displayed before processing
- ✅ Context memory tracks "HEKAT MODE: ACTIVE"

When HEKAT mode is **INACTIVE**:
- ❌ Queries processed normally (no classification)
- ❌ Need to use `/hekat <query>` for individual classification

## Quick Examples

```
Activate mode:
  /hekat
  → "HEKAT MODE ACTIVATED - All queries will be classified L1-L7"

In mode, just query:
  "explain JWT"
  → "L1 Ultra-Fast | [R] Research | ✅ Ready"
  → Then processes your query with optimal agents

Another query in mode:
  "design microservices platform"
  → "L5 Hierarchical | [Ctrl+H] | Est 7250 tokens | ✅ Proceed"
  → Then processes your query

Exit mode:
  /hekat-exit
  → "HEKAT MODE DEACTIVATED - Returning to normal operation"
```

## Advanced Single-Query Usage (without mode)

```
/hekat "explain JWT"                    → L1 single research agent
/hekat "design auth endpoint"           → L3 design → implement → test
/hekat [P] "compare API frameworks"     → L4 parallel consensus
/hekat @L7 "build microservices"       → L7 full ensemble
/hekat --verbose "your query"           → Show phase-by-phase tokens
```

## TIER Hotkey System

**TIER 1 - Single Keys (Always Available)**
```
[R] Research      [D] Design        [T] Test         [B] Build
[F] Frontend      [I] Implement     [O] Orchestrate  [S] Synthesize
[C] Code-review   [P] Parallel      [V] Verify       [A] Analyze
```

**TIER 2 - Ctrl-Modifiers (Force Specific Level)**
```
[Ctrl+P] L4 Parallel      [Ctrl+H] L5 Hierarchical
[Ctrl+I] L6 Iterative     [Ctrl+E] L7 Ensemble
[Ctrl+F] L5 Frontend-specific
```

**TIER 3 - Agent Chains (Advanced DSL)**
```
[R>D>I]         Research → Design → Implement chain
[P:R||D||A]     Parallel: Research, Design, Analyze
[I:D→P→T]       Iterative: Design → (Parallel run) → Test
```

## Complexity Levels (L1-L7)

### L1: Ultra-Fast (600-1200 tokens)
**When**: Single quick question
**Agents**: 1 (specialist)
**Example**: `/hekat [R] "explain JWT"`

### L2: Fast Chain (1500-3000 tokens)
**When**: Two-step workflow
**Agents**: 2 in sequence (A → B)
**Example**: `/hekat "design API, then document"`

### L3: Balanced (2500-4500 tokens)
**When**: Full feature development
**Agents**: 3 in sequence (design → implement → test)
**Example**: `/hekat [D>I>T] "build authentication"`

### L4: Parallel (3000-6000 tokens)
**When**: Multiple perspectives needed
**Agents**: 2-3 in parallel with consensus
**Example**: `/hekat [P] "compare FastAPI vs Express"`

### L5: Hierarchical (5500-9000 tokens)
**When**: Architecture with oversight
**Agents**: Lead → parallel team → synthesis
**Example**: `/hekat @L5 "design microservices platform"`

### L6: Iterative (8000-12000 tokens)
**When**: Refactor/optimize with feedback
**Agents**: 4-6 agents with loops
**Example**: `/hekat "refactor authentication module"`

### L7: Full Ensemble (12000-22000 tokens)
**When**: Major system redesign
**Agents**: 7+ agents, all patterns
**Example**: `/hekat @L7 "build from scratch"`

## Current Implementation Status

🚀 **TIER 1**: Command is callable, accepts queries
⏳ **TIER 2**: Complexity classification (Phase 2)
⏳ **TIER 3**: Token tracking display (Phase 2)
⏳ **TIER 4**: Consciousness learning (Phase 3)

## See Also

- **QUERY_BUILDER_SPECIFICATION.md**: Complete technical specification
- **TIER_HOTKEY_REFERENCE.md**: Full hotkey matrix with examples
- **IMPLEMENTATION_ROADMAP.md**: Build roadmap and design details
- `/hekat --help`: Show this help message
