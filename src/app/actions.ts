'use server';

import { suggestTaskPriorityFlow } from '@/ai/flows/suggestTaskPriority';
import { z } from 'zod';

const PriorityEnum = z.enum(['Low', 'Medium', 'High']);

export async function suggestTaskPriorityAction(taskDescription: string): Promise<{ priority: z.infer<typeof PriorityEnum> } | { error: string }> {
  if (!taskDescription.trim()) {
    return { error: 'Task description cannot be empty.' };
  }
  
  try {
    const { priority } = await suggestTaskPriorityFlow({ taskDescription });
    const validatedPriority = PriorityEnum.parse(priority);
    return { priority: validatedPriority };
  } catch (error) {
    console.error('AI priority suggestion failed:', error);
    return { error: 'Failed to get AI suggestion. Please try again or set priority manually.' };
  }
}
