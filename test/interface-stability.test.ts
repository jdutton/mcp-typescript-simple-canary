import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Import framework packages to test interface stability
import { defineTool, ToolRegistry } from '@mcp-typescript-simple/tools';
import { EnvironmentConfig } from '@mcp-typescript-simple/config';
import { LLMManager } from '@mcp-typescript-simple/tools-llm';

/**
 * Interface Stability Tests
 *
 * These tests validate that the public APIs of @mcp-typescript-simple
 * packages remain stable across releases.
 *
 * Breaking changes detected here indicate:
 * 1. Missing exports
 * 2. Changed function signatures
 * 3. Removed classes or interfaces
 * 4. Changed constructor parameters
 *
 * This suite catches breaking changes before they reach production.
 */

describe('Tool System Interface Stability', () => {
  describe('defineTool function', () => {
    it('should export defineTool function', () => {
      expect(typeof defineTool).toBe('function');
    });

    it('should support tool definition with Zod schema', () => {
      const tool = defineTool({
        name: 'test-tool',
        description: 'Test tool for interface stability',
        inputSchema: z.object({
          input: z.string().describe('Test input')
        }),
        handler: async ({ input }) => ({
          content: [{ type: 'text', text: `Received: ${input}` }]
        })
      });

      expect(tool.name).toBe('test-tool');
      expect(tool.description).toBe('Test tool for interface stability');
      expect(tool.inputSchema).toBeDefined();
      expect(tool.handler).toBeDefined();
      expect(typeof tool.handler).toBe('function');
    });

    it('should support optional input fields', () => {
      const tool = defineTool({
        name: 'optional-test',
        description: 'Test optional fields',
        inputSchema: z.object({
          required: z.string(),
          optional: z.string().optional()
        }),
        handler: async () => ({ content: [] })
      });

      expect(tool.inputSchema).toBeDefined();
    });

    it('should support enum input fields', () => {
      const tool = defineTool({
        name: 'enum-test',
        description: 'Test enum fields',
        inputSchema: z.object({
          format: z.enum(['a', 'b', 'c'])
        }),
        handler: async () => ({ content: [] })
      });

      expect(tool.inputSchema).toBeDefined();
    });
  });

  describe('ToolRegistry class', () => {
    it('should export ToolRegistry class', () => {
      expect(typeof ToolRegistry).toBe('function');
      expect(ToolRegistry.name).toBe('ToolRegistry');
    });

    it('should support tool registration via add() method', () => {
      const registry = new ToolRegistry();
      const tool = defineTool({
        name: 'test',
        description: 'Test',
        inputSchema: z.object({ input: z.string() }),
        handler: async ({ input }) => ({ content: [{ type: 'text', text: input }] })
      });

      // Verify add() method exists and works
      expect(typeof registry.add).toBe('function');
      registry.add(tool);
      expect(registry.has('test')).toBe(true);
    });

    it('should support tool lookup via get() method', () => {
      const registry = new ToolRegistry();
      const tool = defineTool({
        name: 'lookup-test',
        description: 'Lookup test',
        inputSchema: z.object({}),
        handler: async () => ({ content: [] })
      });

      registry.add(tool);
      const retrieved = registry.get('lookup-test');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('lookup-test');
    });

    it('should support tool existence check via has() method', () => {
      const registry = new ToolRegistry();
      expect(typeof registry.has).toBe('function');
      expect(registry.has('nonexistent')).toBe(false);
    });

    it('should support tool listing via list() method', () => {
      const registry = new ToolRegistry();
      const tool1 = defineTool({
        name: 'tool1',
        description: 'Tool 1',
        inputSchema: z.object({}),
        handler: async () => ({ content: [] })
      });
      const tool2 = defineTool({
        name: 'tool2',
        description: 'Tool 2',
        inputSchema: z.object({}),
        handler: async () => ({ content: [] })
      });

      registry.add(tool1);
      registry.add(tool2);

      const tools = registry.list();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBe(2);
      expect(tools[0]).toHaveProperty('name');
      expect(tools[0]).toHaveProperty('description');
      expect(tools[0]).toHaveProperty('inputSchema');
    });

    it('should support registry merging via merge() method', () => {
      const registry1 = new ToolRegistry();
      const registry2 = new ToolRegistry();

      registry1.add(defineTool({
        name: 'tool1',
        description: 'Tool 1',
        inputSchema: z.object({}),
        handler: async () => ({ content: [] })
      }));

      registry2.add(defineTool({
        name: 'tool2',
        description: 'Tool 2',
        inputSchema: z.object({}),
        handler: async () => ({ content: [] })
      }));

      expect(typeof registry1.merge).toBe('function');
      registry1.merge(registry2);
      expect(registry1.has('tool1')).toBe(true);
      expect(registry1.has('tool2')).toBe(true);
    });

    it('should support async tool invocation via call() method', async () => {
      const registry = new ToolRegistry();
      const tool = defineTool({
        name: 'invoke-test',
        description: 'Invocation test',
        inputSchema: z.object({ message: z.string() }),
        handler: async ({ message }) => ({
          content: [{ type: 'text', text: `Echo: ${message}` }]
        })
      });

      registry.add(tool);
      expect(typeof registry.call).toBe('function');

      const result = await registry.call('invoke-test', { message: 'hello' });
      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
    });
  });
});

describe('Configuration System Interface Stability', () => {
  describe('EnvironmentConfig class', () => {
    it('should export EnvironmentConfig class', () => {
      expect(typeof EnvironmentConfig).toBe('function');
      expect(EnvironmentConfig.name).toBe('EnvironmentConfig');
    });

    it('should support get() static method', () => {
      expect(typeof EnvironmentConfig.get).toBe('function');
      const config = EnvironmentConfig.get();
      expect(config).toBeDefined();
      expect(config).toHaveProperty('NODE_ENV');
    });

    it('should support getTransportMode() static method', () => {
      expect(typeof EnvironmentConfig.getTransportMode).toBe('function');
      const mode = EnvironmentConfig.getTransportMode();
      expect(typeof mode).toBe('string');
      expect(['stdio', 'streamable_http']).toContain(mode);
    });

    it('should support logConfiguration() static method', () => {
      expect(typeof EnvironmentConfig.logConfiguration).toBe('function');
      // Should not throw
      EnvironmentConfig.logConfiguration();
    });
  });
});

describe('LLM System Interface Stability', () => {
  describe('LLMManager class', () => {
    it('should export LLMManager class', () => {
      expect(typeof LLMManager).toBe('function');
      expect(LLMManager.name).toBe('LLMManager');
    });

    it('should support initialize() method', async () => {
      const manager = new LLMManager();
      expect(typeof manager.initialize).toBe('function');

      // Without API keys, initialize() throws (expected behavior)
      // The canary project detects if this behavior changes
      await expect(manager.initialize()).rejects.toThrow('No LLM clients could be initialized');
    });

    it('should support getAvailableProviders() method', () => {
      const manager = new LLMManager();
      expect(typeof manager.getAvailableProviders).toBe('function');

      const providers = manager.getAvailableProviders();
      expect(Array.isArray(providers)).toBe(true);
    });

    it('should support isProviderAvailable() method', () => {
      const manager = new LLMManager();
      expect(typeof manager.isProviderAvailable).toBe('function');

      // Should work with string provider names
      const hasAnthropic = manager.isProviderAvailable('anthropic');
      expect(typeof hasAnthropic).toBe('boolean');
    });
  });
});
