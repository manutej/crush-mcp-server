/**
 * Test suite for execution strategies
 * TDD approach: Write tests first, then implement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FastStrategy } from '../src/strategies/fast.js';
import { BalancedStrategy } from '../src/strategies/balanced.js';
import { QualityStrategy } from '../src/strategies/quality.js';
import { CostOptimizedStrategy } from '../src/strategies/cost-optimized.js';
import { CrushClient } from '../src/crush-client.js';
import { QualityEvaluator } from '../src/evaluator.js';

describe('FastStrategy', () => {
  let strategy: FastStrategy;
  let mockClient: CrushClient;

  beforeEach(() => {
    mockClient = new CrushClient('/usr/local/bin/crush');
    strategy = new FastStrategy(mockClient);
  });

  it('should use a single fast model', async () => {
    const runSpy = vi.spyOn(mockClient, 'run').mockResolvedValue({
      model: 'grok-3-mini',
      output: 'Quick analysis result',
      tokens_in: 100,
      tokens_out: 200,
      cost: 0.001,
      time_seconds: 3,
    });

    const result = await strategy.execute('Test prompt');

    expect(runSpy).toHaveBeenCalledTimes(1);
    expect(runSpy).toHaveBeenCalledWith({
      model: 'grok-3-mini',
      prompt: 'Test prompt',
      maxTokens: 2000,
    });
    expect(result.metadata.models_used).toEqual(['grok-3-mini']);
    expect(result.metadata.strategy).toBe('fast');
  });

  it('should complete in under 10 seconds', async () => {
    vi.spyOn(mockClient, 'run').mockResolvedValue({
      model: 'grok-3-mini',
      output: 'Quick result',
      tokens_in: 100,
      tokens_out: 200,
      cost: 0.001,
      time_seconds: 5,
    });

    const result = await strategy.execute('Test');

    expect(result.metadata.execution_time_seconds).toBeLessThan(10);
  });

  it('should have low cost', async () => {
    vi.spyOn(mockClient, 'run').mockResolvedValue({
      model: 'grok-3-mini',
      output: 'Result',
      tokens_in: 100,
      tokens_out: 200,
      cost: 0.0015,
      time_seconds: 3,
    });

    const result = await strategy.execute('Test');

    expect(result.metadata.total_cost).toBeLessThan(0.01);
  });
});

describe('BalancedStrategy', () => {
  let strategy: BalancedStrategy;
  let mockClient: CrushClient;
  let mockEvaluator: QualityEvaluator;

  beforeEach(() => {
    mockClient = new CrushClient('/usr/local/bin/crush');
    mockEvaluator = new QualityEvaluator();
    strategy = new BalancedStrategy(mockClient, mockEvaluator);
  });

  it('should use two models (fast then quality)', async () => {
    const runSpy = vi.spyOn(mockClient, 'run')
      .mockResolvedValueOnce({
        model: 'grok-3-mini',
        output: 'Quick outline',
        tokens_in: 100,
        tokens_out: 300,
        cost: 0.002,
        time_seconds: 4,
      })
      .mockResolvedValueOnce({
        model: 'claude-haiku-4-5',
        output: 'Detailed refinement with code examples and best practices',
        tokens_in: 400,
        tokens_out: 1000,
        cost: 0.014,
        time_seconds: 12,
      });

    const result = await strategy.execute('Design an API');

    expect(runSpy).toHaveBeenCalledTimes(2);
    expect(result.metadata.models_used).toEqual(['grok-3-mini', 'claude-haiku-4-5']);
    expect(result.metadata.strategy).toBe('balanced');
  });

  it('should pass context from first to second model', async () => {
    const runSpy = vi.spyOn(mockClient, 'run')
      .mockResolvedValueOnce({
        model: 'grok-3-mini',
        output: 'Initial analysis',
        tokens_in: 100,
        tokens_out: 300,
        cost: 0.002,
        time_seconds: 4,
      })
      .mockResolvedValueOnce({
        model: 'claude-haiku-4-5',
        output: 'Refined result',
        tokens_in: 400,
        tokens_out: 1000,
        cost: 0.014,
        time_seconds: 12,
      });

    await strategy.execute('Test prompt');

    const secondCall = runSpy.mock.calls[1][0];
    expect(secondCall.prompt).toContain('Initial analysis');
  });

  it('should balance cost and quality', async () => {
    vi.spyOn(mockClient, 'run')
      .mockResolvedValueOnce({
        model: 'grok-3-mini',
        output: 'Quick',
        tokens_in: 100,
        tokens_out: 200,
        cost: 0.001,
        time_seconds: 3,
      })
      .mockResolvedValueOnce({
        model: 'claude-haiku-4-5',
        output: `# Detailed Analysis

This is a comprehensive response with multiple sections covering architecture, implementation, and best practices.

## Architecture Design

The system uses a microservice architecture with REST API endpoints for authentication and authorization. The database layer implements SQL queries with proper indexing for performance optimization.

## Implementation Guide

\`\`\`typescript
async function processRequest(data: RequestType): Promise<Response> {
  const result = await api.execute();
  return result;
}
\`\`\`

## Key Considerations

- Scalability through caching and queue management
- Security with encryption and hash functions
- Performance optimization with async/await patterns
- Deployment using containerized services

This approach ensures proper authentication, efficient database access, and optimal latency for the streaming pipeline.`,
        tokens_in: 300,
        tokens_out: 800,
        cost: 0.007,
        time_seconds: 10,
      });

    const result = await strategy.execute('Test');

    // Should cost less than quality strategy but more than fast
    expect(result.metadata.total_cost).toBeGreaterThan(0.005);
    expect(result.metadata.total_cost).toBeLessThan(0.05);

    // Should have decent quality (>0.5)
    expect(result.metadata.quality_score).toBeGreaterThan(0.5);
  });
});

describe('QualityStrategy', () => {
  let strategy: QualityStrategy;
  let mockClient: CrushClient;
  let mockEvaluator: QualityEvaluator;

  beforeEach(() => {
    mockClient = new CrushClient('/usr/local/bin/crush');
    mockEvaluator = new QualityEvaluator();
    strategy = new QualityStrategy(mockClient, mockEvaluator, 3);
  });

  it('should use multiple models for comprehensive analysis', async () => {
    const runSpy = vi.spyOn(mockClient, 'run')
      .mockResolvedValueOnce({
        model: 'grok-3-mini',
        output: 'Quick outline',
        tokens_in: 100,
        tokens_out: 300,
        cost: 0.002,
        time_seconds: 4,
      })
      .mockResolvedValueOnce({
        model: 'claude-sonnet-4-5',
        output: 'Detailed analysis with architecture diagrams and examples',
        tokens_in: 500,
        tokens_out: 2000,
        cost: 0.045,
        time_seconds: 20,
      })
      .mockResolvedValueOnce({
        model: 'claude-haiku-4-5',
        output: 'Best practices and considerations',
        tokens_in: 600,
        tokens_out: 1500,
        cost: 0.016,
        time_seconds: 15,
      });

    const result = await strategy.execute('Design a microservices system');

    expect(runSpy).toHaveBeenCalledTimes(3);
    expect(result.metadata.models_used).toContain('grok-3-mini');
    expect(result.metadata.models_used).toContain('claude-sonnet-4-5');
    expect(result.metadata.strategy).toBe('quality');
  });

  it('should iterate until quality threshold met', async () => {
    let callCount = 0;
    vi.spyOn(mockClient, 'run').mockImplementation(async () => {
      callCount++;
      if (callCount <= 2) {
        // First two calls: low quality
        return {
          model: callCount === 1 ? 'grok-3-mini' : 'claude-haiku-4-5',
          output: 'Brief response',
          tokens_in: 100,
          tokens_out: 200,
          cost: 0.003,
          time_seconds: 5,
        };
      } else {
        // Third call: high quality
        return {
          model: 'claude-sonnet-4-5',
          output: `# Comprehensive Microservices Architecture Guide

## Executive Summary

This comprehensive guide covers the complete architecture, implementation, and deployment of a production-ready microservices system using modern patterns and best practices.

## System Architecture

The system implements a distributed microservices architecture with the following core components:

### API Gateway Layer

The API gateway handles authentication, authorization, and routing to downstream services. It implements:

- REST API endpoints with proper versioning
- GraphQL interface for complex queries
- Rate limiting and caching strategies
- Load balancing across service instances

### Service Layer

Individual microservices are containerized and deployed using Kubernetes for scalability:

\`\`\`typescript
interface ServiceConfig {
  name: string;
  endpoints: string[];
  database: DatabaseConfig;
  cache: CacheConfig;
}

async function deployService(config: ServiceConfig): Promise<DeploymentResult> {
  const container = await buildContainer(config);
  const deployment = await kubernetes.deploy(container);
  return { status: 'deployed', endpoint: deployment.url };
}
\`\`\`

### Data Layer

The data layer uses SQL databases for transactional data and NoSQL for document storage:

- PostgreSQL for relational data with proper indexing
- MongoDB for document storage and flexible schemas
- Redis for caching and session management
- Message queue (Kafka) for async communication

## Implementation Details

### Authentication Flow

\`\`\`typescript
async function authenticate(credentials: Credentials): Promise<Token> {
  const hash = await encryption.hash(credentials.password);
  const user = await database.query('SELECT * FROM users WHERE email = $1', [credentials.email]);

  if (await validateHash(hash, user.password)) {
    return generateJWT({ userId: user.id, role: user.role });
  }

  throw new AuthenticationError('Invalid credentials');
}
\`\`\`

### Service Communication

Services communicate through:

- Synchronous REST calls for immediate responses
- Asynchronous message queues for background processing
- Event streaming for real-time updates
- Circuit breaker pattern for resilience

## Deployment Strategy

### Container Orchestration

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: user-api
        image: user-service:latest
        resources:
          limits:
            cpu: "1"
            memory: "512Mi"
\`\`\`

### Monitoring and Observability

- Prometheus for metrics collection
- Grafana for visualization
- ELK stack for log aggregation
- Distributed tracing with Jaeger

## Performance Optimization

Key optimization strategies include:

- Database query optimization with proper indexes
- Caching frequently accessed data in Redis
- Horizontal scaling of stateless services
- CDN for static asset delivery
- Lazy loading and code splitting in frontend
- Connection pooling for database efficiency
- Async processing of non-critical operations

## Security Considerations

- TLS/SSL encryption for all communication
- OAuth2 and JWT for authentication and authorization
- Input validation and sanitization to prevent SQL injection
- Rate limiting to prevent DoS attacks
- Secrets management using Vault
- Regular security audits and penetration testing

## Best Practices Summary

- Implement health checks for all services
- Use semantic versioning for API endpoints
- Maintain comprehensive API documentation
- Implement proper error handling and logging
- Use feature flags for gradual rollouts
- Automate testing with CI/CD pipelines
- Monitor latency and performance metrics
- Plan for disaster recovery and backup strategies

## Conclusion

This architecture provides a scalable, resilient, and maintainable foundation for building modern cloud-native applications. By following these patterns and best practices, teams can ensure optimal performance, security, and developer productivity throughout the application lifecycle.`,
          tokens_in: 500,
          tokens_out: 2000,
          cost: 0.045,
          time_seconds: 20,
        };
      }
    });

    const result = await strategy.execute('Complex task');

    expect(result.metadata.iterations).toBeGreaterThan(0);
    expect(result.metadata.quality_score).toBeGreaterThan(0.7);
  });

  it('should stop at max iterations even if quality not met', async () => {
    vi.spyOn(mockClient, 'run').mockResolvedValue({
      model: 'grok-3-mini',
      output: 'Brief',
      tokens_in: 100,
      tokens_out: 100,
      cost: 0.001,
      time_seconds: 2,
    });

    const result = await strategy.execute('Test');

    expect(result.metadata.iterations).toBeLessThanOrEqual(3);
  });
});

describe('CostOptimizedStrategy', () => {
  let strategy: CostOptimizedStrategy;
  let mockClient: CrushClient;

  beforeEach(() => {
    mockClient = new CrushClient('/usr/local/bin/crush');
    strategy = new CostOptimizedStrategy(mockClient, 0.01);
  });

  it('should stay within budget', async () => {
    vi.spyOn(mockClient, 'run').mockResolvedValue({
      model: 'grok-3-mini',
      output: 'Budget-conscious result',
      tokens_in: 100,
      tokens_out: 500,
      cost: 0.003,
      time_seconds: 4,
    });

    const result = await strategy.execute('Test with $0.01 budget');

    expect(result.metadata.total_cost).toBeLessThanOrEqual(0.01);
  });

  it('should use cheapest adequate model', async () => {
    const runSpy = vi.spyOn(mockClient, 'run').mockResolvedValue({
      model: 'grok-3-mini',
      output: 'Result',
      tokens_in: 100,
      tokens_out: 300,
      cost: 0.002,
      time_seconds: 3,
    });

    const result = await strategy.execute('Simple task');

    expect(runSpy).toHaveBeenCalledWith(expect.objectContaining({
      model: 'grok-3-mini',
    }));
    expect(result.metadata.strategy).toBe('cost-optimized');
  });

  it('should not exceed max cost budget', async () => {
    vi.spyOn(mockClient, 'run').mockResolvedValue({
      model: 'grok-3-mini',
      output: 'Response',
      tokens_in: 1000,
      tokens_out: 5000,
      cost: 0.008,
      time_seconds: 8,
    });

    const result = await strategy.execute('Large task', 0.005);

    // Should still respect the budget
    expect(result.metadata.total_cost).toBeLessThanOrEqual(0.01);
  });
});
