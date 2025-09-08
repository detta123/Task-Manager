"use client";

import { motion } from "framer-motion";
import { Check, Trash2, ChevronDown, Flag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: "Low" | "Medium" | "High" | "None";
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSetPriority: (id: string, priority: Task["priority"]) => void;
}

const priorityConfig = {
    High: { variant: "destructive", label: "High" },
    Medium: { variant: "secondary", label: "Medium" },
    Low: { variant: "default", label: "Low" },
    None: { variant: "outline", label: "No Priority" },
} as const;

export function TaskItem({
  task,
  onToggle,
  onDelete,
  onSetPriority,
}: TaskItemProps) {
  const { variant, label } = priorityConfig[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 transition-colors",
        task.completed ? "bg-muted/50" : "bg-card"
      )}
    >
      <Checkbox
        id={`task-${task.id}`}
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        aria-label={`Mark task "${task.text}" as ${task.completed ? 'pending' : 'completed'}`}
      />
      <label
        htmlFor={`task-${task.id}`}
        className={cn(
          "flex-grow cursor-pointer text-sm transition-colors",
          task.completed && "text-muted-foreground line-through"
        )}
      >
        {task.text}
      </label>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-sm">
             <Badge variant={variant}>{label}</Badge>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => onSetPriority(task.id, 'High')}>
            <Badge variant="destructive" className="mr-2">High</Badge> High
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onSetPriority(task.id, 'Medium')}>
            <Badge variant="secondary" className="mr-2">Medium</Badge> Medium
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onSetPriority(task.id, 'Low')}>
            <Badge variant="default" className="mr-2">Low</Badge> Low
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onSetPriority(task.id, 'None')}>
            <Badge variant="outline" className="mr-2">None</Badge> None
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive h-8 w-8"
        onClick={() => onDelete(task.id)}
        aria-label={`Delete task "${task.text}"`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}
