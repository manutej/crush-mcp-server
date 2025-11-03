/**
 * Quality Strategy - Multiple models with iterative refinement
 * Target: <60s, highest quality, willing to pay more
 */

import { CrushClient } from '../crush-client.js';
import { QualityEvaluator } from '../evaluator.js';
import { ExecuteResult } from '../types.js';
import { Strategy } from './base.js';

export class QualityStrategy implements Strategy {
  constructor(
    private client: CrushClient,
    private evaluator: QualityEvaluator,
    private maxIterations: number = 3
  ) {}

  async execute(prompt: string): Promise<ExecuteResult> {
    const startTime = Date.now();
    const modelsUsed: string[] = [];
    let totalCost = 0;
    let iterations = 0;
    let currentOutput = '';
    let qualityScore = 0;

    // Step 1: Fast outline
    const outlineResult = await this.client.run({
      model: 'grok-3-mini',
      prompt,
      maxTokens: 2000,
    });

    modelsUsed.push(outlineResult.model);
    totalCost += outlineResult.cost;
    currentOutput = outlineResult.output;
    iterations++;

    // Step 2: Detailed analysis with Sonnet
    const detailPrompt = `Provide a comprehensive, detailed analysis:

## Original Task
${prompt}

## Initial Outline
${currentOutput}

## Requirements
1. Detailed architecture and design
2. Multiple code examples
3. Step-by-step implementation guide
4. Error handling and edge cases
5. Testing strategies
6. Best practices and patterns`;

    const detailResult = await this.client.run({
      model: 'claude-sonnet-4-5',
      prompt: detailPrompt,
      maxTokens: 8000,
    });

    modelsUsed.push(detailResult.model);
    totalCost += detailResult.cost;
    currentOutput = detailResult.output;
    iterations++;
    qualityScore = this.evaluator.evaluate(currentOutput);

    // Step 3: Iterative refinement until quality threshold (0.75) or max iterations
    while (qualityScore < 0.75 && iterations < this.maxIterations) {
      const refinementPrompt = `The previous response needs more depth. Enhance it further:

Current Response:
${currentOutput}

Add:
1. More detailed examples
2. Architecture diagrams (ASCII art)
3. Performance considerations
4. Security best practices
5. Deployment strategies`;

      const refinementResult = await this.client.run({
        model: iterations % 2 === 0 ? 'claude-sonnet-4-5' : 'claude-haiku-4-5',
        prompt: refinementPrompt,
        maxTokens: 6000,
      });

      modelsUsed.push(refinementResult.model);
      totalCost += refinementResult.cost;
      currentOutput = refinementResult.output;
      iterations++;
      qualityScore = this.evaluator.evaluate(currentOutput);
    }

    const executionTime = (Date.now() - startTime) / 1000;

    return {
      result: currentOutput,
      metadata: {
        models_used: modelsUsed,
        total_cost: totalCost,
        execution_time_seconds: executionTime,
        quality_score: qualityScore,
        strategy: 'quality',
        iterations,
      },
    };
  }
}
