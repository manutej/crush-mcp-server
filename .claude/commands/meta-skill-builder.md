---
description: Meta-command for building multiple skills in parallel using Context7 research, general-purpose agents, and validated workflows
allowed-tools: Read(~/.claude/agents/skill-builder.md), Glob(~/Library/Application Support/Claude/skills/**/SKILL.md), Task(*), mcp__context7__resolve-library-id, mcp__context7__get-library-docs, mcp__linear-server__*
---

# /meta-skill-builder

Advanced skill building system that leverages parallel agent execution, Context7 research, and Linear project management to create production-ready Claude Code skills.

## Usage

```bash
/meta-skill-builder [skills...] [flags]
```

## Flags

- `--parallel` - Build skills in parallel (default: true)
- `--context7` - Use Context7 for documentation research (default: true)
- `--linear` - Create Linear project and track progress (default: false)
- `--template [name]` - Base skills on existing template
- `--dry-run` - Preview what will be built
- `--help` - Show this help

## Arguments

**[skills...]**: Space-separated list of skills to build, or path to YAML config file

## Workflow Architecture

```
User Request
   ↓
Meta-Skill-Builder Command
   ↓
┌──────────────────────────────────────┐
│ 1. Parse skill requirements          │
│ 2. Create Linear project (optional)  │
│ 3. Resolve libraries with Context7   │
│ 4. Launch parallel agents            │
│ 5. Monitor progress                  │
│ 6. Validate results                  │
│ 7. Update Linear issues              │
│ 8. Generate summary report           │
└──────────────────────────────────────┘
   ↓
Production-Ready Skills
```

## Example 1: Build Multiple Skills in Parallel

```bash
/meta-skill-builder playwright-visual-testing react-patterns jest-react-testing
```

**What happens:**
1. Parses 3 skill names
2. Resolves each library via Context7
3. Launches 3 general-purpose agents in parallel
4. Each agent:
   - Fetches Context7 documentation
   - Reads skill-builder.md template
   - Creates SKILL.md, README.md, EXAMPLES.md
   - Validates YAML frontmatter
5. Monitors completion
6. Reports results

## Example 2: Build from YAML Configuration

```bash
/meta-skill-builder --config skills-config.yaml --linear
```

**skills-config.yaml:**
```yaml
project:
  name: "Q1 Skills Development"
  team: "engineering"

skills:
  - name: playwright-visual-testing
    context7: playwright
    priority: tier-1
    examples: 15+

  - name: fastapi-development
    context7: fastapi
    priority: tier-1
    examples: 17+

  - name: docker-compose-orchestration
    context7: docker
    priority: tier-2
    examples: 15+
```

**Execution:**
1. Creates Linear project "Q1 Skills Development"
2. Creates 3 Linear issues (CET-XXX)
3. Builds all 3 skills in parallel
4. Updates Linear issues to "Done"
5. Generates final report

## Example 3: Build with Template

```bash
/meta-skill-builder my-custom-api --template fastapi-development
```

**What happens:**
1. Reads fastapi-development as template
2. Extracts structure and patterns
3. Applies to my-custom-api
4. Creates skill following same format

## Implementation Pattern

### Step 1: Skill Requirements Analysis

```typescript
// Parse user input
const skills = [
  {
    name: 'playwright-visual-testing',
    context7Library: 'playwright',
    priority: 'tier-1',
    targetSize: '20KB+',
    examples: 15
  },
  // ...
];
```

### Step 2: Context7 Research (Per Skill)

```typescript
// Resolve library ID
const libraryId = await context7.resolveLibraryId('playwright');

// Fetch documentation
const docs = await context7.getLibraryDocs({
  id: libraryId,
  topic: 'browser automation, visual testing, screenshots',
  tokens: 8000
});
```

### Step 3: Parallel Agent Execution

**CRITICAL LEARNING:** Use `general-purpose` subagent_type, NOT `skill-builder`

```typescript
// Launch agents in PARALLEL with single Task call block
const agents = [
  {
    type: 'general-purpose',
    skill: 'playwright-visual-testing',
    context7Data: playwrightDocs
  },
  {
    type: 'general-purpose',
    skill: 'react-patterns',
    context7Data: reactDocs
  },
  // ... up to 8 agents in parallel
];

// Single message with multiple Task tool calls
for (const agent of agents) {
  Task({
    subagent_type: 'general-purpose',
    description: `Build ${agent.skill} skill`,
    prompt: buildSkillPrompt(agent)
  });
}
```

### Step 4: Agent Prompt Template

```markdown
Build a comprehensive skill: **{skill-name}**

## Research with Context7
{context7-docs}

## Template Reference
Read: ~/Library/Application Support/Claude/skills/linear-dev-accelerator/SKILL.md

## Create Skill
Directory: ~/Library/Application Support/Claude/skills/{skill-name}/

**SKILL.md** (20KB+):
\```yaml
---
name: {skill-name}
description: {comprehensive-description}
---
\```

Include:
- When to Use This Skill
- Core Concepts
- Tool/API Reference
- Workflow Patterns
- Best Practices
- 15+ Examples

**README.md** (10KB): Overview and setup
**EXAMPLES.md** (15KB+): Detailed examples

Return: Summary with file details
```

## Success Criteria

Each skill must have:
- ✅ Valid YAML frontmatter
- ✅ SKILL.md ≥ 20 KB
- ✅ README.md ≥ 10 KB
- ✅ EXAMPLES.md ≥ 15 KB (if applicable)
- ✅ 10+ practical examples
- ✅ Context7 research integrated
- ✅ Validated structure

## Validation Checklist

```bash
# For each completed skill
for skill in skills/*; do
  # Check YAML frontmatter
  head -10 $skill/SKILL.md | grep -q "^---$"

  # Check file sizes
  [ $(stat -f%z "$skill/SKILL.md") -gt 20000 ]

  # Validate structure
  grep -q "## When to Use This Skill" $skill/SKILL.md
  grep -q "## Core Concepts" $skill/SKILL.md
  grep -q "## Examples" $skill/SKILL.md
done
```

## Linear Integration

When `--linear` flag is used:

### Project Creation

```typescript
const project = await linear.projects.create({
  name: "Claude Skills Development",
  team: teamId,
  description: `Building ${skills.length} skills with Context7 research`,
  priority: 2,
  labels: ["skills", "infrastructure"]
});
```

### Issue Creation (Per Skill)

```typescript
for (const skill of skills) {
  await linear.issues.create({
    team: teamId,
    project: project.id,
    title: `[SKILL] Build ${skill.name}`,
    description: generateIssueDescription(skill),
    labels: ["skills", skill.category],
    priority: skill.priority,
    state: "In Progress"
  });
}
```

### Progress Tracking

```typescript
// Update issue when skill completes
await linear.issues.update({
  id: issueId,
  state: "Done",
  comment: generateCompletionComment(skillResult)
});
```

## Error Handling

### Agent Failure

If an agent fails:
1. Log error details
2. Mark Linear issue as "Blocked"
3. Continue with other agents
4. Report failures in summary

### Context7 Errors

If Context7 unavailable:
1. Fall back to general documentation
2. Warn user about reduced quality
3. Continue with best effort

### Validation Failures

If skill validation fails:
1. Show specific validation errors
2. Provide fix suggestions
3. Allow manual correction
4. Re-validate after fixes

## Output Format

```markdown
# Meta-Skill-Builder Results

## Summary
- Skills Requested: 8
- Skills Completed: 7
- Skills Failed: 1
- Total Documentation: 695 KB

## Completed Skills

1. ✅ playwright-visual-testing (128 KB)
   - Context7: playwright (Trust Score 9.5)
   - Examples: 94+ screenshots
   - Agent: general-purpose
   - Time: 3.2 minutes

2. ✅ react-patterns (103 KB)
   - Context7: react (Trust Score 10)
   - Examples: 20 components
   - Agent: general-purpose
   - Time: 2.8 minutes

[... more skills ...]

## Failed Skills

1. ❌ claude-sdk-integration-patterns
   - Error: API concurrency limit
   - Context7: Fetched successfully
   - Recommendation: Re-run individually

## Linear Project

Project: https://linear.app/team/project/skills-abc123
Issues: CET-101 through CET-108
Completion: 87.5%

## Next Steps

1. Review completed skills
2. Fix failed skills
3. Activate skills: /skill-use [name]
4. Test with real workflows
```

## Best Practices

### 1. Parallel Execution

✅ **Do:**
- Launch all agents in single message (single Task call block)
- Use general-purpose subagent_type
- Provide complete prompts upfront

❌ **Don't:**
- Launch agents sequentially
- Use non-existent subagent types (skill-builder)
- Split into multiple messages

### 2. Context7 Integration

✅ **Do:**
- Resolve library IDs first
- Fetch comprehensive documentation
- Provide research in agent prompt

❌ **Don't:**
- Skip Context7 research
- Use outdated documentation
- Ignore trust scores

### 3. Linear Integration

✅ **Do:**
- Create project for organization
- Track each skill as issue
- Update status in real-time

❌ **Don't:**
- Create issues without project
- Leave orphaned issues
- Forget to mark complete

## Advanced Usage

### Custom Validation Rules

```yaml
validation:
  yaml_frontmatter: required
  min_size:
    SKILL.md: 20000  # 20 KB
    README.md: 10000  # 10 KB
  required_sections:
    - "When to Use This Skill"
    - "Core Concepts"
    - "Examples"
    - "Best Practices"
  min_examples: 10
```

### Skill Templates

Create reusable templates:

```bash
# Create template from existing skill
/meta-skill-builder --create-template fastapi-development

# Use template
/meta-skill-builder my-new-api --template fastapi-development
```

## Related Commands

- `/skill-build [name]` - Build single skill interactively
- `/skill-use [name]` - Activate a skill
- `/skills` - List and manage skills
- `/wflw skill-building-workflow` - Execute workflow YAML

## Troubleshooting

### Issue: Agents not launching in parallel

**Cause:** Multiple messages or sequential calls

**Fix:** Use single message with multiple Task calls:
```typescript
// ✅ Correct
<function_calls>
<invoke name="Task">...</invoke>
<invoke name="Task">...</invoke>
<invoke name="Task">...</invoke>