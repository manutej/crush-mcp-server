#!/usr/bin/env node

/**
 * Crush MCP Server
 * Exposes Crush CLI multi-model orchestration as MCP tools
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { Orchestrator } from './orchestrator.js';
import { ExecuteRequest } from './types.js';

// Initialize orchestrator
const orchestrator = new Orchestrator();

// Create MCP server
const server = new Server(
  {
    name: 'crush-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
const TOOLS: Tool[] = [
  {
    name: 'crush_execute',
    description:
      'Execute a prompt using Crush CLI with automatic multi-model orchestration. ' +
      'Supports multiple execution strategies: fast (quick, cheap), balanced (default, good quality/cost), ' +
      'quality (comprehensive, highest quality), cost-optimized (minimal cost).',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'The prompt to execute',
        },
        strategy: {
          type: 'string',
          enum: ['fast', 'balanced', 'quality', 'cost-optimized'],
          description: 'Execution strategy (default: balanced)',
        },
        max_cost: {
          type: 'number',
          description: 'Maximum cost in USD (optional, used with cost-optimized strategy)',
        },
        context: {
          type: 'string',
          description: 'Additional context from previous interactions (optional)',
        },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'crush_evaluate',
    description:
      'Estimate cost, time, and quality for executing a prompt with a given strategy without actually executing it.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'The prompt to evaluate',
        },
        strategy: {
          type: 'string',
          enum: ['fast', 'balanced', 'quality', 'cost-optimized'],
          description: 'Execution strategy to evaluate (default: balanced)',
        },
        max_cost: {
          type: 'number',
          description: 'Maximum cost budget for cost-optimized strategy',
        },
      },
      required: ['prompt'],
    },
  },
];

// Handle list_tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

// Handle call_tool request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    return {
      content: [{ type: 'text', text: 'Missing arguments' }],
      isError: true,
    };
  }

  try {
    if (name === 'crush_execute') {
      const executeRequest: ExecuteRequest = {
        prompt: args.prompt as string,
        strategy: (args.strategy as any) || 'balanced',
        max_cost: args.max_cost as number | undefined,
        context: args.context as string | undefined,
      };

      // Add context to prompt if provided
      if (executeRequest.context) {
        executeRequest.prompt = `${executeRequest.context}\n\n${executeRequest.prompt}`;
      }

      const result = await orchestrator.execute(executeRequest);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                result: result.result,
                metadata: {
                  models_used: result.metadata.models_used,
                  total_cost: result.metadata.total_cost.toFixed(4),
                  execution_time_seconds: result.metadata.execution_time_seconds.toFixed(2),
                  quality_score: result.metadata.quality_score.toFixed(2),
                  strategy: result.metadata.strategy,
                  iterations: result.metadata.iterations,
                },
              },
              null,
              2
            ),
          },
        ],
      };
    } else if (name === 'crush_evaluate') {
      const executeRequest: ExecuteRequest = {
        prompt: args.prompt as string,
        strategy: (args.strategy as any) || 'balanced',
        max_cost: args.max_cost as number | undefined,
      };

      const estimate = await orchestrator.estimate(executeRequest);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                estimated_cost: estimate.estimated_cost.toFixed(4),
                estimated_time_seconds: estimate.estimated_time_seconds,
                expected_quality: estimate.expected_quality.toFixed(2),
                strategy: executeRequest.strategy,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `Unknown tool: ${name}`,
        },
      ],
      isError: true,
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is reserved for MCP protocol)
  console.error('Crush MCP Server running on stdio');
  console.error('Available tools: crush_execute, crush_evaluate');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
