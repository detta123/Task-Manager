"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Sparkles, Filter, Wind } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { suggestTaskPriorityAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { TaskItem, type Task } from "@/components/TaskItem";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const taskSchema = z.object({
  text: z.string().min(3, "Task must be at least 3 characters long."),
});

type TaskFormData = z.infer<typeof taskSchema>;
type Priority = "Low" | "Medium" | "High";

export function TaskMaster() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [filter, setFilter] = React.useState("");
  const [isAiLoading, setIsAiLoading] = React.useState(false);
  const [aiSuggestion, setAiSuggestion] = React.useState<Priority | null>(null);
  const [suggestedForText, setSuggestedForText] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("pending");

  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const taskText = watch("text");

  React.useEffect(() => {
    try {
      const storedTasks = localStorage.getItem("tasks");
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Failed to parse tasks from localStorage", error);
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to save tasks to localStorage", error);
    }
  }, [tasks]);

  const handleAddTask = (data: TaskFormData) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: data.text,
      completed: false,
      priority: 'None',
    };
    setTasks((prev) => [newTask, ...prev]);
    reset();
  };

  const handleToggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleSetPriority = (id: string, priority: Task["priority"]) => {
    setTasks(
      tasks.map((task) => (task.id === id ? { ...task, priority } : task))
    );
  };
  
  const handleAiSuggest = async () => {
    if (!taskText || taskText.length < 3) {
        toast({
            title: "Task too short",
            description: "Please enter a more descriptive task for the AI to analyze.",
            variant: "destructive",
        });
        return;
    }
    setIsAiLoading(true);
    setSuggestedForText(taskText);
    const result = await suggestTaskPriorityAction(taskText);
    setIsAiLoading(false);

    if ("error" in result) {
      toast({
        title: "AI Suggestion Failed",
        description: result.error,
        variant: "destructive",
      });
    } else {
      setAiSuggestion(result.priority);
    }
  };
  
  const handleApplyAiSuggestion = () => {
    if (aiSuggestion) {
      const newTask: Task = {
        id: crypto.randomUUID(),
        text: suggestedForText,
        completed: false,
        priority: aiSuggestion,
      };
      setTasks((prev) => [newTask, ...prev]);
      reset();
    }
    setAiSuggestion(null);
    setSuggestedForText("");
  };


  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) =>
      task.text.toLowerCase().includes(filter.toLowerCase())
    );
  }, [tasks, filter]);

  const pendingTasks = filteredTasks.filter((task) => !task.completed);
  const completedTasks = filteredTasks.filter((task) => task.completed);

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl shadow-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-check"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L9 13"/></svg>
            </div>
            <span className="font-headline text-2xl tracking-tight">TaskMaster</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(handleAddTask)} className="space-y-4">
            <div className="flex gap-2">
                <Input
                    placeholder="Add a new task..."
                    {...register("text")}
                    className="flex-grow text-base"
                />
                <Button type="button" variant="outline" size="icon" onClick={handleAiSuggest} disabled={isAiLoading || !taskText}>
                    <Sparkles className={cn("h-4 w-4", isAiLoading && "animate-spin")} />
                    <span className="sr-only">Suggest Priority</span>
                </Button>
                <Button type="submit" size="icon">
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add Task</span>
                </Button>
            </div>
            {errors.text && <p className="text-sm text-destructive">{errors.text.message}</p>}
        </form>
        
        <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter tasks..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10"
            />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
          </TabsList>
          <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                <TabsContent value="pending" className="mt-4 space-y-2">
                    <AnimatePresence>
                    {pendingTasks.length > 0 ? (
                        pendingTasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggle={handleToggleTask}
                                onDelete={handleDeleteTask}
                                onSetPriority={handleSetPriority}
                            />
                        ))
                    ) : (
                        <div className="text-center py-10 text-muted-foreground flex flex-col items-center gap-4">
                            <Wind className="h-10 w-10"/>
                            <p>All tasks completed. Well done!</p>
                        </div>
                    )}
                    </AnimatePresence>
                </TabsContent>
                <TabsContent value="completed" className="mt-4 space-y-2">
                    <AnimatePresence>
                    {completedTasks.length > 0 ? (
                        completedTasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggle={handleToggleTask}
                                onDelete={handleDeleteTask}
                                onSetPriority={handleSetPriority}
                            />
                        ))
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>No completed tasks yet.</p>
                        </div>
                    )}
                    </AnimatePresence>
                </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>

        <AlertDialog open={!!aiSuggestion} onOpenChange={(open) => !open && setAiSuggestion(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>AI Priority Suggestion</AlertDialogTitle>
              <AlertDialogDescription>
                Based on your task, the AI suggests setting the priority to{' '}
                <strong className="text-foreground">{aiSuggestion}</strong>. Would you like to add this task with the suggested priority?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogAction onClick={handleApplyAiSuggestion}>Add Task</AlertDialogAction>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
