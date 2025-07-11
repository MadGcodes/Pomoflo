
import { useState } from "react";
import { Check, Trash2, Pencil } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

interface TaskItemProps {
  id: string;
  title: string;
  completed: boolean;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
}

const TaskItem = ({ id, title, completed, onComplete, onDelete, onEdit }: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const handleEdit = () => {
    if (isEditing) {
      onEdit(id, editedTitle);
    }
    setIsEditing(!isEditing);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onEdit(id, editedTitle);
      setIsEditing(false);
    }
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg mb-2 ${completed ? 'bg-pomoflo-darkPurple/30' : 'bg-pomoflo-darkPurple/20'}`}>
      <div className="flex items-center gap-3 flex-1">
        <Checkbox 
          checked={completed} 
          id={`task-${id}`} 
          className="border-white" 
          onCheckedChange={() => onComplete(id)}
        />
        
        {isEditing ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-b border-white text-white focus:outline-none"
            autoFocus
          />
        ) : (
          <label 
            htmlFor={`task-${id}`}
            className={`flex-1 text-sm ${completed ? 'line-through text-gray-400' : 'text-white'}`}
          >
            {title}
          </label>
        )}
      </div>
      
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-pomoflo-darkPurple/30"
          onClick={handleEdit}
        >
          <Pencil size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-300 hover:text-white hover:bg-pomoflo-darkPurple/30"
          onClick={() => onDelete(id)}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
};

export default TaskItem;
