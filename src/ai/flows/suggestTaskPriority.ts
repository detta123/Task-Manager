import { defineFlow, generate } from 'genkit';
import { z } from 'zod';
import { ai } from '../genkit';

export const suggestTaskPriorityFlow = defineFlow(
  {
    name: 'suggestTaskPriorityFlow',
    inputSchema: z.object({ taskDescription: z.string() }),
    outputSchema: z.object({ priority: z.enum(['Low', 'Medium', 'High']) }),
  },
  async ({ taskDescription }) => {
    const prompt = `You are an expert project manager. Based on the following task description, suggest a priority level.
    The priority can only be 'Low', 'Medium', or 'High'.
    Analyze the task for urgency, importance, and keywords that imply deadlines or significant impact.
    For example, tasks with words like 'report', 'urgent', 'deadline', 'blocker' should be high priority.
    Tasks about planning or brainstorming can be lower priority.
    
    Task: "${taskDescription}"
    
    Return ONLY one word: 'Low', 'Medium', or 'High'.`;

    const llmResponse = await generate({
      model: ai.model,
      prompt,
      config: {
        temperature: 0.1,
      },
    });

    const priority = llmResponse.text().trim();

    if (priority === 'Low' || priority === 'Medium' || priority === 'High') {
      return { priority };
    }

    // Fallback if the model doesn't return a valid priority
    return { priority: 'Medium' };
  }
);
