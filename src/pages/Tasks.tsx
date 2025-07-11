
import { useState } from "react";
import { useTasks } from "@/contexts/TaskContext";
import TaskItem from "@/components/TaskItem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Tasks = () => {
  const navigate = useNavigate();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const { tasks, addTask, completeTask, deleteTask, editTask } = useTasks();
  
  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle);
      setNewTaskTitle("");
    }
  };
  
  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  
  return (
    <div className="flex min-h-screen flex-col pomoflo-container bg-pomoflo-background">
      <header className="flex items-center p-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/home')}
          className="text-white hover:bg-pomoflo-darkPurple/20 mr-auto"
        >
          <ArrowLeft size={24} />
        </Button>
        <div className="mx-auto font-bold text-lg text-white">To Do List</div>
        <div className="bg-white/10 px-3 py-1 rounded-full text-white text-sm flex items-center ml-auto">
          <span className="mr-1">🪙</span>
          <span>7</span>
        </div>
      </header>
      
      <div className="p-4">
        <div className="flex mb-4">
          <Input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="bg-pomoflo-darkPurple/20 border-none text-white placeholder:text-gray-400"
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAddTask}
            className="ml-2 bg-pomoflo-purple text-white"
          >
            <Plus size={20} />
          </Button>
        </div>
        
        <div className="mb-6">
          <h3 className="text-white text-sm mb-2">Pending</h3>
          <div className="space-y-2">
            {pendingTasks.length === 0 ? (
              <p className="text-gray-400 text-center text-sm py-4">No pending tasks</p>
            ) : (
              pendingTasks.map(task => (
                <TaskItem
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  completed={task.completed}
                  onComplete={completeTask}
                  onDelete={deleteTask}
                  onEdit={editTask}
                />
              ))
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-white text-sm mb-2">Completed</h3>
          <div className="space-y-2">
            {completedTasks.length === 0 ? (
              <p className="text-gray-400 text-center text-sm py-4">No completed tasks</p>
            ) : (
              completedTasks.map(task => (
                <TaskItem
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  completed={task.completed}
                  onComplete={completeTask}
                  onDelete={deleteTask}
                  onEdit={editTask}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
