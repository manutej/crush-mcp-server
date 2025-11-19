---
name: hekat-exit
description: Exit HEKAT persistent mode and return to normal query processing
---

# /hekat-exit Command

## Purpose

Deactivate HEKAT persistent mode and return to normal query processing.

Use this when you've finished working in HEKAT mode and want to process queries normally.

## Usage

```
/hekat-exit              # Deactivate HEKAT mode
/hekat-exit --confirm   # Explicit confirmation
```

## What Happens

When you run `/hekat-exit`:

1. **HEKAT Mode Deactivated** - Persistent classification disabled
2. **Session Summary** - Shows how many queries you classified
3. **Return to Normal** - Queries process without automatic classification
4. **Can Reactivate** - Use `/hekat` anytime to activate mode again

## Example

```
In HEKAT mode:
  Your query 1
  → L1 Classification

  Your query 2
  → L5 Classification

Exit mode:
  /hekat-exit
  → "HEKAT MODE DEACTIVATED"
  → "Session: 2 queries, last was L5"

Back to normal:
  Your next query
  → No automatic classification

  Use /hekat <query> if you want classification
```

## Persistence Note

While in HEKAT mode:
- ✅ All queries automatically classified
- ✅ Complexity level shown before processing
- ✅ Mode persists across multiple queries
- ✅ Context memory tracks "HEKAT MODE: ACTIVE"

After deactivation:
- ❌ No automatic classification
- ❌ Use `/hekat <query>` for individual classification
- ❌ Use `/hekat` to reactivate mode

## Related Commands

- `/hekat` - Activate HEKAT persistent mode
- `/hekat --help` - Show HEKAT command reference
- `/hekat <query>` - Single query classification (no mode activation)

## See Also

- [HEKAT Command](hekat.md) - Main command documentation
- [Query Builder Specification](../QUERY_BUILDER_SPECIFICATION.md) - Technical details
