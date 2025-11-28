import { ToolRegistry } from '@mcp-typescript-simple/tools';
import { currentTimestampTool } from './current-timestamp.js';

/**
 * Canary Project Tools
 *
 * Custom tools for the canary project that demonstrate
 * usage of the @mcp-typescript-simple framework.
 */
export function createCanaryTools(): ToolRegistry {
  const registry = new ToolRegistry();
  registry.add(currentTimestampTool);
  return registry;
}

export { currentTimestampTool };
