'use server';

import {z} from 'zod';
import {ai} from '../genkit';

const PrioritizeTaskInputSchema = z.object({
  taskDescription: z.string(),
});

const PrioritizeTaskOutputSchema = z.object({
  priority: z.enum(['Low', 'Medium', 'High']),
});

const suggestTaskPriorityPrompt = ai.definePrompt({
  name: 'suggestTaskPriorityPrompt',
  input: {schema: PrioritizeTaskInputSchema},
  output: {schema: PrioritizeTaskOutputSchema},
  prompt: `You are an expert project manager. Based on the following task description, suggest a priority level.
    The priority can only be 'Low', 'Medium', or 'High'.
    Analyze the task for urgency, importance, and keywords that imply deadlines or significant impact.
    For example, tasks with words like 'report', 'urgent', 'deadline', 'blocker' should be high priority.
    Tasks about planning or brainstorming can be lower priority.
    
    Task: "{{taskDescription}}"
    
    Respond in a JSON format.`,
  config: {
    temperature: 0.1,
  },
});

export const suggestTaskPriorityFlow = ai.defineFlow(
  {
    name: 'suggestTaskPriorityFlow',
    inputSchema: PrioritizeTaskInputSchema,
    outputSchema: PrioritizeTaskOutputSchema,
  },
  async ({taskDescription}) => {
    const {output} = await suggestTaskPriorityPrompt({taskDescription});
    if (output) {
      return output;
    }

    // Fallback if the model doesn't return a valid priority
    return {priority: 'Medium'};
  }
);
