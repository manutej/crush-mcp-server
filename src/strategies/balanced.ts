/**
 * Balanced Strategy - Two models (fast + quality)
 * Target: <30s, balanced cost/quality
 */

import { CrushClient } from '../crush-client.js';
import { QualityEvaluator } from '../evaluator.js';
import { ExecuteResult } from '../types.js';
import { Strategy } from './base.js';

export class BalancedStrategy implements Strategy {
  constructor(
    private client: CrushClient,
    private evaluator: QualityEvaluator
  ) {}

  async execute(prompt: string): Promise<ExecuteResult> {
    const startTime = Date.now();
    const modelsUsed: string[] = [];
    let totalCost = 0;

    // Step 1: Fast model for initial outline
    const initialResult = await this.client.run({
      model: 'grok-3-mini',
      prompt,
      maxTokens: 2000,
    });

    modelsUsed.push(initialResult.model);
    totalCost += initialResult.cost;

    // Step 2: Quality model for refinement
    const refinementPrompt = `Refine and expand this analysis with more detail:

## Original Task
${prompt}

## Initial Analysis
${initialResult.output}

## Your Task
Provide a refined, detailed analysis including:
1. More comprehensive breakdown
2. Code examples where appropriate
3. Best practices
4. Implementation considerations`;

    const refinedResult = await this.client.run({
      model: 'claude-haiku-4-5',
      prompt: refinementPrompt,
      maxTokens: 4000,
    });

    modelsUsed.push(refinedResult.model);
    totalCost += refinedResult.cost;

    const executionTime = (Date.now() - startTime) / 1000;
    const qualityScore = this.evaluator.evaluate(refinedResult.output);

    return {
      result: refinedResult.output,
      metadata: {
        models_used: modelsUsed,
        total_cost: totalCost,
        execution_time_seconds: executionTime,
        quality_score: qualityScore,
        strategy: 'balanced',
        iterations: 2,
      },
    };
  }
}
