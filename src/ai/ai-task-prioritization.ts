'use server';

/**
 * @fileOverview An AI-powered task prioritization flow.
 *
 * - prioritizeTask - A function that suggests a priority for a task based on its description and deadline.
 * - PrioritizeTaskInput - The input type for the prioritizeTask function.
 * - PrioritizeTaskOutput - The return type for the prioritizeTask function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeTaskInputSchema = z.object({
  description: z.string().describe('The description of the task.'),
  deadline: z.string().describe('The deadline of the task.'),
});
export type PrioritizeTaskInput = z.infer<typeof PrioritizeTaskInputSchema>;

const PrioritizeTaskOutputSchema = z.object({
  priority: z
    .enum(['high', 'medium', 'low'])
    .describe('The suggested priority for the task.'),
  reason: z.string().describe('The reason for the suggested priority.'),
});
export type PrioritizeTaskOutput = z.infer<typeof PrioritizeTaskOutputSchema>;

export async function prioritizeTask(input: PrioritizeTaskInput): Promise<PrioritizeTaskOutput> {
  return prioritizeTaskFlow(input);
}

const prioritizeTaskPrompt = ai.definePrompt({
  name: 'prioritizeTaskPrompt',
  input: {schema: PrioritizeTaskInputSchema},
  output: {schema: PrioritizeTaskOutputSchema},
  prompt: `You are a helpful AI assistant that suggests a priority (high, medium, or low) for a task based on its description and deadline.

Task description: {{{description}}}
Task deadline: {{{deadline}}}

Respond in a JSON format.
`,
});

const prioritizeTaskFlow = ai.defineFlow(
  {
    name: 'prioritizeTaskFlow',
    inputSchema: PrioritizeTaskInputSchema,
    outputSchema: PrioritizeTaskOutputSchema,
  },
  async input => {
    const {output} = await prioritizeTaskPrompt(input);
    return output!;
  }
);
