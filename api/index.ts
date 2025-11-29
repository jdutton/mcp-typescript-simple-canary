/**
 * Vercel Serverless Function Entry Point
 *
 * This wraps the MCP server for Vercel's serverless environment.
 * Note: Vercel functions have limitations:
 * - 10s execution timeout (can be extended to 60s on Pro plans)
 * - Stateless - each request creates a new instance
 * - Redis session management is used to maintain state across requests
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import the server initialization
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ToolRegistry } from "@mcp-typescript-simple/tools";
import { basicTools } from "@mcp-typescript-simple/example-tools-basic";
import { LLMManager } from "@mcp-typescript-simple/tools-llm";
import { createLLMTools } from "@mcp-typescript-simple/example-tools-llm";
import { setupMCPServerWithRegistry } from "@mcp-typescript-simple/server";
import { createCanaryTools } from "../dist/tools/index.js";
import { TransportFactory } from "@mcp-typescript-simple/http-server";
import { logger } from "@mcp-typescript-simple/observability";
import { initializeLoggerProvider } from "@mcp-typescript-simple/observability/logger";
import { logs } from '@opentelemetry/api-logs';

// Cache the server instance and transport
let serverInstance: any = null;
let transportInstance: any = null;
let toolRegistry: ToolRegistry | null = null;

async function initializeServer() {
  if (serverInstance && transportInstance) {
    return { server: serverInstance, transport: transportInstance, registry: toolRegistry };
  }

  // Initialize logger
  const loggerProviderGlobal = logs.getLoggerProvider();
  if (loggerProviderGlobal.toString() === 'NoopLoggerProvider') {
    await initializeLoggerProvider();
  }

  // Initialize LLM manager
  const llmManager = new LLMManager();

  // Create MCP server
  const server = new Server(
    {
      name: "mcp-typescript-simple",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Initialize tool registry
  const registry = new ToolRegistry();
  registry.merge(basicTools);
  logger.info("Basic tools loaded", { count: basicTools.list().length });

  // Register canary tools
  const canaryTools = createCanaryTools();
  registry.merge(canaryTools);
  logger.info("Canary tools loaded", { count: canaryTools.list().length });

  // Try to initialize LLM tools
  try {
    await llmManager.initialize();
    const llmTools = createLLMTools(llmManager);
    registry.merge(llmTools);
    logger.info("LLM tools loaded", { count: llmTools.list().length });
  } catch (error) {
    logger.warn("LLM initialization failed - LLM tools will be unavailable", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Setup MCP server
  await setupMCPServerWithRegistry(server, registry, logger);

  // Create transport
  const transportManager = TransportFactory.createFromEnvironment();
  await transportManager.initialize(server, registry);

  // Cache instances
  serverInstance = server;
  transportInstance = transportManager;
  toolRegistry = registry;

  logger.info("Vercel serverless function initialized");

  return { server, transport: transportManager, registry };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Initialize server if needed
    await initializeServer();

    // For now, return health check
    // TODO: Integrate with transport layer to handle actual MCP requests
    if (req.url === '/health' || req.url === '/api/health') {
      return res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        deployment: 'vercel',
        mode: 'serverless',
      });
    }

    // For MCP endpoint, we need to proxy to the transport
    // This is a challenge because the transport expects a full HTTP server
    // For now, return a message about the limitation
    return res.status(200).json({
      message: 'MCP Server on Vercel',
      note: 'Vercel serverless deployment requires additional configuration',
      endpoints: {
        health: '/api/health',
      },
    });
  } catch (error) {
    logger.error("Vercel handler error", error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
