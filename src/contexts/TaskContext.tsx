import {
  createContext, useContext, useState, useEffect, ReactNode
} from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebase";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (title: string) => void;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, title: string) => void;
}

const TaskContext = createContext<TaskContextType | null>(null);
export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        setUserId(user.uid);
        const q = query(
          collection(FIREBASE_DB, "users", user.uid, "tasks"),
          orderBy("createdAt", "desc")
        );

        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const loadedTasks: Task[] = [];
          snapshot.forEach((doc) =>
            loadedTasks.push({ id: doc.id, ...doc.data() } as Task)
          );
          setTasks(loadedTasks);
        });

        return () => unsubscribeSnapshot();
      } else {
        setTasks([]);
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const addTask = async (title: string) => {
    if (!userId || !title.trim()) return;

    await addDoc(collection(FIREBASE_DB, "users", userId, "tasks"), {
      title: title.trim(),
      completed: false,
      createdAt: Date.now(),
    });
  };

  const completeTask = async (id: string) => {
    if (!userId) return;
    const taskRef = doc(FIREBASE_DB, "users", userId, "tasks", id);
    const task = tasks.find((t) => t.id === id);
    if (task) {
      await updateDoc(taskRef, { completed: !task.completed });
    }
  };

  const deleteTask = async (id: string) => {
    if (!userId) return;
    const taskRef = doc(FIREBASE_DB, "users", userId, "tasks", id);
    await deleteDoc(taskRef);
  };

  const editTask = async (id: string, title: string) => {
    if (!userId || !title.trim()) return;
    const taskRef = doc(FIREBASE_DB, "users", userId, "tasks", id);
    await updateDoc(taskRef, { title: title.trim() });
  };

  const value = {
    tasks,
    addTask,
    completeTask,
    deleteTask,
    editTask,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
