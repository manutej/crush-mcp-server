/**
 * Quality evaluation utilities
 */

import { QualityMetrics } from './types.js';

export class QualityEvaluator {
  /**
   * Evaluate the quality of an output
   * Returns a score from 0 to 1
   */
  evaluate(output: string): number {
    const metrics = this.extractMetrics(output);
    return this.calculateScore(metrics);
  }

  /**
   * Extract quality metrics from output
   */
  extractMetrics(output: string): QualityMetrics {
    const lines = output.split('\n');

    return {
      word_count: output.split(/\s+/).length,
      code_blocks: (output.match(/```/g) || []).length / 2, // Pairs of ```
      headers: lines.filter(line => line.trim().startsWith('#')).length,
      lists: lines.filter(line => /^\s*[-*]\s/.test(line)).length,
      technical_terms: this.countTechnicalTerms(output),
    };
  }

  /**
   * Calculate quality score from metrics
   * Heuristic-based scoring with weights
   */
  private calculateScore(metrics: QualityMetrics): number {
    let score = 0;

    // Word count (max 30%)
    if (metrics.word_count > 100) score += 0.10;
    if (metrics.word_count > 300) score += 0.10;
    if (metrics.word_count > 500) score += 0.10;

    // Structure (max 30%)
    if (metrics.code_blocks > 0) score += 0.15;
    if (metrics.headers > 0) score += 0.10;
    if (metrics.lists > 0) score += 0.05;

    // Technical depth (max 20%)
    if (metrics.technical_terms > 3) score += 0.10;
    if (metrics.technical_terms > 7) score += 0.10;

    // Completeness (max 20%)
    const hasIntro = /^(##?\s|[A-Z].*:)/m.test(metrics.word_count > 0 ? 'yes' : 'no');
    if (hasIntro) score += 0.10;
    const hasConclusion = /(conclusion|summary|in summary|to summarize)/i.test('placeholder');
    if (hasConclusion) score += 0.10;

    return Math.min(score, 1.0);
  }

  /**
   * Count technical terms (simplified)
   */
  private countTechnicalTerms(output: string): number {
    const terms = [
      'API', 'REST', 'GraphQL', 'database', 'SQL', 'NoSQL',
      'function', 'class', 'interface', 'type', 'async', 'await',
      'algorithm', 'architecture', 'microservice', 'container',
      'authentication', 'authorization', 'encryption', 'hash',
      'cache', 'queue', 'stream', 'pipeline', 'deployment',
      'scalability', 'performance', 'optimization', 'latency',
    ];

    const lowerOutput = output.toLowerCase();
    return terms.filter(term => lowerOutput.includes(term.toLowerCase())).length;
  }
}
