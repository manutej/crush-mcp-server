/**
 * Crush CLI client wrapper
 */

import { spawn } from 'child_process';
import { ModelResult } from './types.js';

export interface CrushRunOptions {
  model?: string;
  prompt: string;
  session?: string;
  maxTokens?: number;
}

export class CrushClient {
  constructor(private binaryPath: string = '/opt/homebrew/bin/crush') {}

  /**
   * Execute a prompt with Crush
   */
  async run(options: CrushRunOptions): Promise<ModelResult> {
    const startTime = Date.now();

    const args: string[] = ['run'];

    if (options.model) {
      args.push('--model', options.model);
    }

    if (options.session) {
      args.push('--session', options.session);
    }

    return new Promise((resolve, reject) => {
      const crush = spawn(this.binaryPath, args);

      let stdout = '';
      let stderr = '';

      // Send prompt via stdin
      crush.stdin.write(options.prompt);
      crush.stdin.end();

      crush.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      crush.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      crush.on('close', (code) => {
        const endTime = Date.now();
        const timeSeconds = (endTime - startTime) / 1000;

        if (code !== 0) {
          reject(new Error(`Crush exited with code ${code}: ${stderr}`));
          return;
        }

        // Estimate tokens (rough approximation: 1 token ≈ 4 chars)
        const tokensIn = Math.ceil(options.prompt.length / 4);
        const tokensOut = Math.ceil(stdout.length / 4);

        // Estimate cost based on model
        const cost = this.estimateCost(options.model || 'unknown', tokensIn, tokensOut);

        resolve({
          model: options.model || 'default',
          output: stdout.trim(),
          tokens_in: tokensIn,
          tokens_out: tokensOut,
          cost,
          time_seconds: timeSeconds,
        });
      });

      crush.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Estimate cost for a model execution
   * Based on approximate token costs
   */
  private estimateCost(model: string, tokensIn: number, tokensOut: number): number {
    const costs: Record<string, { in: number; out: number }> = {
      'grok-3-mini': { in: 0.50, out: 0.50 },
      'grok-code-fast': { in: 0.50, out: 0.50 },
      'claude-haiku-4-5': { in: 1.00, out: 5.00 },
      'claude-haiku-4-5-20251001': { in: 1.00, out: 5.00 },
      'claude-sonnet-4-5': { in: 3.00, out: 15.00 },
      'claude-sonnet-4-5-20250929': { in: 3.00, out: 15.00 },
      'claude-opus-4-1': { in: 15.00, out: 75.00 },
    };

    const modelCosts = costs[model] || costs['claude-haiku-4-5'];

    // Cost per million tokens
    const costIn = (tokensIn / 1_000_000) * modelCosts.in;
    const costOut = (tokensOut / 1_000_000) * modelCosts.out;

    return costIn + costOut;
  }
}
