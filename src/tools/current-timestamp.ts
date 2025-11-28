import { defineTool } from '@mcp-typescript-simple/tools';
import { z } from 'zod';

/**
 * Current Timestamp Tool
 *
 * Returns the current timestamp in various formats with optional timezone support.
 * This tool demonstrates:
 * - Using the @mcp-typescript-simple/tools API
 * - Zod schema validation with optional fields
 * - Timezone handling with Intl.DateTimeFormat
 * - Multiple output formats
 *
 * This is the canary project's test tool for detecting breaking changes
 * in the @mcp-typescript-simple framework.
 */
export const currentTimestampTool = defineTool({
  name: 'current-timestamp',
  description: 'Get current timestamp with optional timezone and format specification',
  inputSchema: z.object({
    timezone: z
      .string()
      .optional()
      .describe('IANA timezone identifier (e.g., America/New_York, Europe/London, Asia/Tokyo)'),
    format: z
      .enum(['unix', 'iso', 'human'])
      .default('unix')
      .describe('Output format: unix (seconds), iso (ISO 8601), or human (readable string)')
  }),
  handler: async ({ timezone, format }) => {
    try {
      const now = new Date();
      let result: string;
      let displayTimezone: string | undefined;

      // Apply timezone if specified
      if (timezone) {
        try {
          // Validate timezone by attempting to create DateTimeFormat
          // This will throw if timezone is invalid
          new Intl.DateTimeFormat('en-US', { timeZone: timezone });
          displayTimezone = timezone;
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `Invalid timezone: ${timezone}. Use IANA timezone identifiers (e.g., America/New_York, Europe/London, Asia/Tokyo)`
            }],
            isError: true
          };
        }
      }

      // Format based on requested format
      switch (format) {
        case 'unix':
          result = Math.floor(now.getTime() / 1000).toString();
          break;

        case 'iso':
          if (timezone) {
            // For ISO format with timezone, we need to construct the date string
            // in the specified timezone, then parse it back to ISO format
            const formatter = new Intl.DateTimeFormat('en-US', {
              timeZone: timezone,
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
              timeZoneName: 'short'
            });
            result = formatter.format(now);
          } else {
            result = now.toISOString();
          }
          break;

        case 'human':
          if (timezone) {
            const formatter = new Intl.DateTimeFormat('en-US', {
              timeZone: timezone,
              dateStyle: 'full',
              timeStyle: 'long'
            });
            result = formatter.format(now);
          } else {
            result = now.toString();
          }
          break;

        default:
          // Should never reach here due to Zod validation
          result = now.toISOString();
      }

      // Build response message
      const timezoneInfo = displayTimezone ? ` (${displayTimezone})` : '';
      const formatInfo = format !== 'unix' ? ` in ${format} format` : '';

      return {
        content: [{
          type: 'text',
          text: `Current timestamp${formatInfo}${timezoneInfo}: ${result}`
        }]
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [{
          type: 'text',
          text: `Error getting timestamp: ${errorMessage}`
        }],
        isError: true
      };
    }
  }
});
