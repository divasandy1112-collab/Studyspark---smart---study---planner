import { useEffect, useMemo, useState } from 'react';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type StudyTask = {
  id: string;
  subject: string;
  title: string;
  deadline: string;
  difficulty: Difficulty;
  confidence: number;
  estimatedMinutes: number;
  completed: boolean;
  isSample: boolean;
};

const STORAGE_KEY = 'studyspark.tasks.v1';

function localDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function offsetDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localDateString(date);
}

export function createSampleTasks(): StudyTask[] {
  return [
    { id: 'sample-bio', subject: 'Biology', title: 'Review cell respiration notes', deadline: offsetDate(1), difficulty: 'hard', confidence: 2, estimatedMinutes: 45, completed: false, isSample: true },
    { id: 'sample-history', subject: 'World History', title: 'Outline the French Revolution essay', deadline: offsetDate(3), difficulty: 'medium', confidence: 3, estimatedMinutes: 60, completed: false, isSample: true },
    { id: 'sample-math', subject: 'Calculus', title: 'Practice integration techniques', deadline: offsetDate(6), difficulty: 'hard', confidence: 3, estimatedMinutes: 35, completed: false, isSample: true },
    { id: 'sample-literature', subject: 'Literature', title: 'Read and annotate chapter 8', deadline: offsetDate(10), difficulty: 'easy', confidence: 4, estimatedMinutes: 25, completed: true, isSample: true },
  ];
}

export function useStudyTasks() {
  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        const parsed: unknown = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed as StudyTask[] : createSampleTasks();
      }
    } catch {
      return createSampleTasks();
    }
    return createSampleTasks();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Keep the in-memory planner usable when browser storage is unavailable.
    }
  }, [tasks]);

  const activeTasks = useMemo(() => {
    const today = localDateString(new Date());
    const daysUntil = (deadline: string) => Math.ceil((new Date(`${deadline}T12:00:00`).getTime() - new Date(`${today}T12:00:00`).getTime()) / 86400000);
    return tasks.filter((task) => !task.completed).map((task) => {
      // tasks due today or overdue receive the highest urgency scory 
      const days = daysUntil(task.deadline);
      const deadlinePoints = days <= 0 ? 50 : days === 1 ? 45 : days <= 3 ? 35 : days <= 7 ? 25 : days <= 14 ? 15 : 5;
      const difficultyPoints = task.difficulty === 'easy' ? 10 : task.difficulty === 'medium' ? 20 : 30;
      const confidencePoints = task.confidence <= 2 ? 20 : task.confidence === 3 ? 12 : 5;
      return { ...task, score: deadlinePoints + difficultyPoints + confidencePoints, deadlinePoints, difficultyPoints, confidencePoints, daysUntil: days };
    }).sort((a, b) => b.score - a.score || a.deadline.localeCompare(b.deadline) || a.title.localeCompare(b.title));
  }, [tasks]);

  const addTask = (task: Omit<StudyTask, 'id' | 'completed' | 'isSample'>) => {
    setTasks((current) => [{ ...task, id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, completed: false, isSample: false }, ...current]);
  };
  const toggleTask = (id: string) => setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task));
  const removeTask = (id: string) => setTasks((current) => current.filter((task) => task.id !== id));

  return { tasks, activeTasks, addTask, toggleTask, removeTask };
}

export function formatDeadline(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}
