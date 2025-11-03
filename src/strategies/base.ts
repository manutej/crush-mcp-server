/**
 * Base strategy interface and abstract class
 */

import { ExecuteResult, ExecuteRequest } from '../types.js';

export interface Strategy {
  execute(prompt: string, maxCost?: number): Promise<ExecuteResult>;
}
