import { z as zod } from 'zod'

interface Server {
  tool: (
    name: string,
    description: string,
    schema: Record<string, any>,
    handler: (args: any) => Promise<any>
  ) => void
}

interface ResourceTemplate {
  // ResourceTemplate interface can be extended based on actual requirements
}

export function configureMcp (
  server: Server,
  ResourceTemplate?: ResourceTemplate,
  z: typeof zod = zod
) {
  try {
    // Register the task sample generator tool
    console.log('🔧 [CONFIG] Registering task-sample-generator tool...')
    server.tool(
      'task-sample-generator',
      'Generate diverse task samples based on tool descriptions and requirements',
      {
        function_call_description: z
          .string()
          .describe('Tool descriptions to base tasks on'),
        complexity: z
          .enum(['simple', 'medium', 'advanced', 'all levels'])
          .optional()
          .default('all levels')
          .describe(
            'Desired complexity level of generated tasks (default: all levels)'
          ),
        num_samples: z
          .number()
          .min(1)
          .max(10)
          .optional()
          .default(5)
          .describe('Number of task samples to generate (default: 3)'),
        include_edge_cases: z
          .boolean()
          .optional()
          .default(true)
          .describe(
            'Whether to include edge cases in generated tasks (default: true)'
          )
      },
      async args => {
        console.log(
          `📤 [TOOL] task-sample-generator called with:`,
          JSON.stringify(args, null, 2)
        )

        const prompt = [
          `Generate diverse task samples based on the provided tool descriptions.`,
          `## Task Sample Requirements:`,
          `1. Natural Language Format`,
          `- Each task should be written as a natural user query`,
          `- Use everyday language without technical jargon`,
          `- Include context and user intent`,

          `2. Tool Agnostic Description`,
          `- Users should not need to know specific tool names`,
          `- Focus on describing the desired outcome`,
          `- Use problem-oriented language`,

          `3. Tool Interaction Patterns`,
          `- Tasks should require various combinations of tool calls`,
          `- Include scenarios for tool chaining`,
          `- Consider data flow between tools`,

          `4. Complexity Levels`,
          `- Simple: Single tool, straightforward input`,
          `- Medium: 2-3 tools, some data transformation`,
          `- Advanced: Multiple tools, complex workflows`,

          `## Input Parameters:`,
          `Tool Descriptions:`,
          `${args.function_call_description}`,

          `Complexity: ${args.complexity || 'all levels'}`,
          `Samples Requested: ${args.num_samples || 3}`,
          `Include Edge Cases: ${args.include_edge_cases || false}`
        ].join('\n')

        return {
          content: [
            {
              type: 'text',
              text: prompt
            }
          ],
          metadata: {
            complexity: args.complexity || 'all levels',
            num_samples: args.num_samples || 5,
            include_edge_cases:
              args.include_edge_cases === undefined
                ? true
                : args.include_edge_cases
          }
        }
      }
    )
    console.log(
      '✅ [CONFIG] task-sample-generator tool registered successfully'
    )
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        `❌ [CONFIG] Error during tool configuration: ${error.message}`
      )
    } else {
      console.error(
        '❌ [CONFIG] An unknown error occurred during tool configuration'
      )
    }
    throw error
  }
}
