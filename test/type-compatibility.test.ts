import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Import framework types to test type compatibility
import type { ToolDefinition } from '@mcp-typescript-simple/tools';
import type { LLMProvider, LLMRequest, LLMResponse, AnyModel } from '@mcp-typescript-simple/tools-llm';
import { defineTool } from '@mcp-typescript-simple/tools';

/**
 * Type Compatibility Tests
 *
 * These tests validate TypeScript type definitions remain stable.
 *
 * Unlike runtime interface tests, these tests catch:
 * 1. Changed type signatures
 * 2. Removed type exports
 * 3. Changed generic constraints
 * 4. Incompatible type changes
 *
 * TypeScript compiler errors = breaking changes detected!
 */

describe('Type System Compatibility', () => {
  describe('ToolDefinition type', () => {
    it('should accept valid tool definitions', () => {
      // This test validates TypeScript type checking at compile time
      const validTool: ToolDefinition<{ input: string }> = {
        name: 'test-tool',
        description: 'Test tool',
        inputSchema: z.object({ input: z.string() }),
        handler: async ({ input }) => ({
          content: [{ type: 'text', text: input }]
        })
      };

      expect(validTool).toBeDefined();
    });

    it('should support optional input fields in type', () => {
      const tool: ToolDefinition<{ required: string; optional?: string }> = {
        name: 'optional-tool',
        description: 'Tool with optional field',
        inputSchema: z.object({
          required: z.string(),
          optional: z.string().optional()
        }),
        handler: async ({ required, optional }) => ({
          content: [{ type: 'text', text: `${required}${optional ?? ''}` }]
        })
      };

      expect(tool).toBeDefined();
    });

    it('should support enum input fields in type', () => {
      type Format = 'unix' | 'iso' | 'human';

      const tool: ToolDefinition<{ format: Format }> = {
        name: 'format-tool',
        description: 'Tool with enum field',
        inputSchema: z.object({
          format: z.enum(['unix', 'iso', 'human'])
        }),
        handler: async ({ format }) => ({
          content: [{ type: 'text', text: format }]
        })
      };

      expect(tool).toBeDefined();
    });
  });

  describe('defineTool type inference', () => {
    it('should infer input type from Zod schema', () => {
      const tool = defineTool({
        name: 'inferred',
        description: 'Type inference test',
        inputSchema: z.object({
          message: z.string(),
          count: z.number().optional()
        }),
        handler: async ({ message, count }) => {
          // TypeScript should infer message: string and count: number | undefined
          const typedMessage: string = message;
          const typedCount: number | undefined = count;

          expect(typeof typedMessage).toBe('string');
          expect(typedCount === undefined || typeof typedCount === 'number').toBe(true);

          return { content: [] };
        }
      });

      expect(tool).toBeDefined();
    });

    it('should infer complex nested types', () => {
      const tool = defineTool({
        name: 'complex',
        description: 'Complex type inference',
        inputSchema: z.object({
          data: z.object({
            nested: z.string(),
            array: z.array(z.number())
          }),
          optional: z.boolean().optional()
        }),
        handler: async ({ data, optional }) => {
          // TypeScript should infer complex nested structure
          const nested: string = data.nested;
          const array: number[] = data.array;
          const optionalBool: boolean | undefined = optional;

          expect(typeof nested).toBe('string');
          expect(Array.isArray(array)).toBe(true);
          expect(optionalBool === undefined || typeof optionalBool === 'boolean').toBe(true);

          return { content: [] };
        }
      });

      expect(tool).toBeDefined();
    });
  });

  describe('LLM type compatibility', () => {
    it('should export LLMProvider type', () => {
      // Compile-time check that LLMProvider type exists
      const providers: LLMProvider[] = ['anthropic', 'openai', 'gemini'];
      expect(providers.length).toBe(3);
    });

    it('should export LLMRequest type with required fields', () => {
      const request: LLMRequest = {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        messages: [{ role: 'user', content: 'test' }],
        options: {
          max_tokens: 100
        }
      };

      expect(request.provider).toBe('anthropic');
    });

    it('should export LLMResponse type with required fields', () => {
      const response: LLMResponse = {
        text: 'response text',
        usage: {
          input_tokens: 10,
          output_tokens: 20,
          total_tokens: 30
        }
      };

      expect(response.text).toBe('response text');
      expect(response.usage.total_tokens).toBe(30);
    });

    it('should export AnyModel type', () => {
      // Compile-time check that AnyModel type exists and accepts known models
      const claudeModel: AnyModel = 'claude-3-5-sonnet-20241022';
      const openaiModel: AnyModel = 'gpt-4o';
      const geminiModel: AnyModel = 'gemini-2.0-flash';

      expect(typeof claudeModel).toBe('string');
      expect(typeof openaiModel).toBe('string');
      expect(typeof geminiModel).toBe('string');
    });
  });

  describe('CallToolResult type compatibility', () => {
    it('should support text content type', async () => {
      const tool = defineTool({
        name: 'text-tool',
        description: 'Text content test',
        inputSchema: z.object({}),
        handler: async () => ({
          content: [{ type: 'text', text: 'Hello' }]
        })
      });

      const result = await tool.handler({});
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should support error flag in result', async () => {
      const tool = defineTool({
        name: 'error-tool',
        description: 'Error handling test',
        inputSchema: z.object({}),
        handler: async () => ({
          content: [{ type: 'text', text: 'Error occurred' }],
          isError: true
        })
      });

      const result = await tool.handler({});
      expect(result.isError).toBe(true);
    });

    it('should support multiple content items', async () => {
      const tool = defineTool({
        name: 'multi-content',
        description: 'Multiple content items',
        inputSchema: z.object({}),
        handler: async () => ({
          content: [
            { type: 'text', text: 'First' },
            { type: 'text', text: 'Second' }
          ]
        })
      });

      const result = await tool.handler({});
      expect(result.content).toHaveLength(2);
    });
  });

  describe('Type safety regressions', () => {
    it('should prevent registering tools with wrong input types', () => {
      // This test will FAIL TO COMPILE if type safety is broken
      const tool = defineTool({
        name: 'type-safe',
        description: 'Type safety check',
        inputSchema: z.object({ count: z.number() }),
        handler: async ({ count }) => {
          // TypeScript should catch if we try to use count as wrong type
          const num: number = count;

          // @ts-expect-error - This SHOULD fail at compile time if count is number
          const str: string = count;

          expect(typeof num).toBe('number');
          expect(str).toBeDefined(); // Runtime check for test completeness

          return { content: [] };
        }
      });

      expect(tool).toBeDefined();
    });

    it('should prevent missing required fields', () => {
      const tool = defineTool({
        name: 'required-fields',
        description: 'Required field check',
        inputSchema: z.object({
          required: z.string()
        }),
        handler: async ({ required }) => {
          // TypeScript should ensure 'required' is always defined
          const value: string = required; // Should not need | undefined

          expect(typeof value).toBe('string');

          return { content: [] };
        }
      });

      expect(tool).toBeDefined();
    });
  });
});
