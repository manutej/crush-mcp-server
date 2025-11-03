/**
 * Orchestrator - Manages execution strategies
 */

import { CrushClient } from './crush-client.js';
import { QualityEvaluator } from './evaluator.js';
import { ExecuteRequest, ExecuteResult, Strategy as StrategyType } from './types.js';
import { Strategy } from './strategies/base.js';
import { FastStrategy } from './strategies/fast.js';
import { BalancedStrategy } from './strategies/balanced.js';
import { QualityStrategy } from './strategies/quality.js';
import { CostOptimizedStrategy } from './strategies/cost-optimized.js';

export class Orchestrator {
  private strategies: Map<string, Strategy>;
  private client: CrushClient;
  private evaluator: QualityEvaluator;

  constructor(crushBinaryPath: string = '/opt/homebrew/bin/crush') {
    this.client = new CrushClient(crushBinaryPath);
    this.evaluator = new QualityEvaluator();

    // Initialize all strategies
    this.strategies = new Map<string, Strategy>([
      ['fast', new FastStrategy(this.client)],
      ['balanced', new BalancedStrategy(this.client, this.evaluator)],
      ['quality', new QualityStrategy(this.client, this.evaluator, 3)],
      ['cost-optimized', new CostOptimizedStrategy(this.client, 0.01)],
    ]);
  }

  /**
   * Execute a prompt using the specified strategy
   */
  async execute(request: ExecuteRequest): Promise<ExecuteResult> {
    const strategy = request.strategy || 'balanced';
    const strategyImpl = this.strategies.get(strategy);

    if (!strategyImpl) {
      throw new Error(`Unknown strategy: ${strategy}`);
    }

    return await strategyImpl.execute(request.prompt, request.max_cost);
  }

  /**
   * Get estimated cost and quality for a strategy without executing
   */
  async estimate(request: ExecuteRequest): Promise<{
    estimated_cost: number;
    estimated_time_seconds: number;
    expected_quality: number;
  }> {
    const strategy = request.strategy || 'balanced';

    // Rough estimates based on strategy
    const estimates = {
      fast: {
        estimated_cost: 0.002,
        estimated_time_seconds: 5,
        expected_quality: 0.6,
      },
      balanced: {
        estimated_cost: 0.015,
        estimated_time_seconds: 20,
        expected_quality: 0.75,
      },
      quality: {
        estimated_cost: 0.06,
        estimated_time_seconds: 45,
        expected_quality: 0.9,
      },
      'cost-optimized': {
        estimated_cost: request.max_cost || 0.01,
        estimated_time_seconds: 8,
        expected_quality: 0.5,
      },
    };

    return estimates[strategy];
  }
}
