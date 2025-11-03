/**
 * Fast Strategy - Single model, quick response
 * Target: <10s, minimal cost
 */

import { CrushClient } from '../crush-client.js';
import { ExecuteResult } from '../types.js';
import { Strategy } from './base.js';

export class FastStrategy implements Strategy {
  constructor(private client: CrushClient) {}

  async execute(prompt: string): Promise<ExecuteResult> {
    const startTime = Date.now();

    // Use fastest, cheapest model
    const result = await this.client.run({
      model: 'grok-3-mini',
      prompt,
      maxTokens: 2000,
    });

    const executionTime = (Date.now() - startTime) / 1000;

    return {
      result: result.output,
      metadata: {
        models_used: [result.model],
        total_cost: result.cost,
        execution_time_seconds: executionTime,
        quality_score: 0.6, // Fast strategy has moderate quality
        strategy: 'fast',
        iterations: 1,
      },
    };
  }
}
