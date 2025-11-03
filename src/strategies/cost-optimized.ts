/**
 * Cost-Optimized Strategy - Minimal cost while maintaining adequacy
 * Target: Stay within strict budget
 */

import { CrushClient } from '../crush-client.js';
import { ExecuteResult } from '../types.js';
import { Strategy } from './base.js';

export class CostOptimizedStrategy implements Strategy {
  constructor(
    private client: CrushClient,
    private defaultMaxCost: number = 0.01
  ) {}

  async execute(prompt: string, maxCost?: number): Promise<ExecuteResult> {
    const startTime = Date.now();
    const budget = maxCost || this.defaultMaxCost;

    // Use cheapest model with minimal tokens
    // Estimate max tokens we can afford
    const costPerMToken = 1.0; // $1 per M tokens for Grok (in + out average)
    const maxTokens = Math.min(
      Math.floor((budget / costPerMToken) * 1_000_000 / 2), // Divide by 2 for safety
      1000 // Hard cap at 1000 tokens
    );

    const result = await this.client.run({
      model: 'grok-3-mini',
      prompt,
      maxTokens,
    });

    const executionTime = (Date.now() - startTime) / 1000;

    return {
      result: result.output,
      metadata: {
        models_used: [result.model],
        total_cost: result.cost,
        execution_time_seconds: executionTime,
        quality_score: 0.5, // Cost-optimized has lower quality
        strategy: 'cost-optimized',
        iterations: 1,
      },
    };
  }
}
