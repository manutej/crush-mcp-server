/**
 * Type definitions for Crush MCP Server
 */

export type Strategy = 'fast' | 'balanced' | 'quality' | 'cost-optimized';

export interface ExecuteRequest {
  prompt: string;
  strategy?: Strategy;
  max_cost?: number;
  context?: string;
}

export interface ModelResult {
  model: string;
  output: string;
  tokens_in: number;
  tokens_out: number;
  cost: number;
  time_seconds: number;
}

export interface ExecuteResult {
  result: string;
  metadata: {
    models_used: string[];
    total_cost: number;
    execution_time_seconds: number;
    quality_score: number;
    strategy: Strategy;
    iterations: number;
  };
}

export interface WorkflowStep {
  model: string;
  prompt: string;
  pass_previous_output?: boolean;
}

export interface MultiModelRequest {
  workflow: WorkflowStep[];
}

export interface QualityMetrics {
  word_count: number;
  code_blocks: number;
  headers: number;
  lists: number;
  technical_terms: number;
}

export interface CrushConfig {
  binary_path: string;
  default_strategy: Strategy;
  cost_limits: {
    fast: number;
    balanced: number;
    quality: number;
    'cost-optimized': number;
  };
}
