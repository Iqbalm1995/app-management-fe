# Kanban Board Implementation Documentation

## Project Overview
We've implemented a drag-and-drop Kanban board for the app-management-fe project. The Kanban board allows users to visualize and manage tasks across different stages of a workflow.

## Current Implementation Status

### Completed Features
1. **Board Structure**
   - Dynamic board columns loaded from backend API
   - Tasks filtered and displayed in their respective columns
   - Visual styling for board columns and task cards

2. **Task Cards**
   - Display of task information (name, code, priority)
   - Priority badges with color coding (red for HIGH, orange for MEDIUM, green for LOW)
   - Progress bar for tasks with progress > 0%
   - User avatars for assigned team members

3. **Drag and Drop Functionality**
   - Implemented using React DnD library
   - Tasks can be dragged between columns
   - Visual feedback during drag operations
   - Local state updates when tasks are moved
   - Highlight effect for recently moved tasks

4. **Task Creation**
   - "Add Task" button in the TO DO column
   - Inline task creation form with keyboard support (Enter to save, Escape to cancel)
   - Integrated with CreateSimpleTask API
   - Visual feedback for newly created tasks

5. **UI/UX Enhancements**
   - Empty state for columns with no tasks
   - Loading overlay during operations
   - Success toast notifications
   - Responsive layout with horizontal scrolling

### Technical Implementation Details

#### State Management
```typescript
// Main state variables
const [DataBoard, setDataBoard] = useState<TaskBoardViewModel[]>([]);
const [DataTasks, setDataTasks] = useState<TaskViewModel[]>([]);
const [recentlyMovedTaskId, setRecentlyMovedTaskId] = useState<string | null>(null);
```

#### Data Models
```typescript
// Board column model
interface TaskBoardViewModel {
  id: string;
  projectId?: string | null;
  backlogId?: string | null;
  boardCodeStage: string;
  boardName: string;
  indexStage: number;
  isDisplay: string;
  boardPoint: number;
  isCompleteFlag: string;
  // ...other properties
}

// Task card model
interface TaskViewModel {
  id: string;
  taskCode: string;
  taskName: string;
  taskPriority: string;
  boardId: string;
  boardName: string;
  boardIndexStage: number;
  // ...other properties
}

// Task creation payload
interface CreateSimpleTaskPayload {
  backlogId: string;
  projectId: string;
  boardId: string;
  taskName: string;
}
```

#### Drag and Drop Components
We created two main components for drag and drop functionality:

1. **DraggableTaskCard**: Makes task cards draggable
```typescript
const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({ task, onMoveTask, isRecentlyMoved = false }) => {
  const dragRef = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag<DroppableTaskItem, unknown, { isDragging: boolean }>({
    type: ItemTypes.TASK,
    item: { id: task.id, boardId: task.boardId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  
  drag(dragRef);
  // ...rendering code
}
```

2. **DroppableBoard**: Makes board columns accept dropped tasks
```typescript
const DroppableBoard: React.FC<DroppableBoardProps> = ({ board, tasks, onMoveTask, children }) => {
  const dropRef = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop<DroppableTaskItem, unknown, { isOver: boolean }>({
    accept: ItemTypes.TASK,
    drop: (item) => {
      if (item.boardId !== board.id) {
        onMoveTask(item.id, board.id);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  
  drop(dropRef);
  // ...rendering code
}
```

#### Task Creation Component
```typescript
const AddTaskForm: React.FC<AddTaskProps> = ({ boardId, projectId, backlogId, onTaskAdded }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toggle between button and form
  const handleAddClick = () => {
    setIsAdding(true);
  };
  
  // Handle form submission with API integration
  const handleSubmit = async () => {
    if (!taskName.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("tokenData") as string;
      const payload: CreateSimpleTaskPayload = {
        backlogId,
        projectId,
        boardId,
        taskName: taskName.trim()
      };
      
      const response = await CreateSimpleTask(payload, token);
      
      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Task created successfully",
          statusToast: "success",
        });
        setTaskName("");
        setIsAdding(false);
        onTaskAdded();
      } else {
        showToast({
          description: response?.message || "Failed to create task",
          statusToast: "error",
        });
      }
    } catch (error) {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };
  
  // Render button or form based on state
  // ...
}
```

#### Task Movement Logic
Currently implemented with local state management:
```typescript
const handleMoveTask = async (taskId: string, newBoardId: string) => {
  setIsLoadingProcess(true);
  
  try {
    // Find the task and target board
    const taskToMove = DataTasks.find(task => task.id === taskId);
    const targetBoard = DataBoard.find(board => board.id === newBoardId);
    
    if (taskToMove && targetBoard) {
      // Simulate a delay to show loading state
      await delay(500);
      
      // Update local state to reflect the change
      setDataTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === taskId) {
            return {
              ...task,
              boardId: newBoardId,
              boardName: targetBoard.boardName,
              boardIndexStage: targetBoard.indexStage,
              boardCodeStage: targetBoard.boardCodeStage
            };
          }
          return task;
        })
      );
      
      // Set recently moved task for visual feedback
      setRecentlyMovedTaskId(taskId);
      
      // Clear the highlight after 2 seconds
      setTimeout(() => {
        setRecentlyMovedTaskId(null);
      }, 2000);
      
      showToast({
        description: `Task moved to ${targetBoard.boardName}`,
        statusToast: "success",
      });
    }
  } catch (error) {
    // Error handling
  } finally {
    setIsLoadingProcess(false);
  }
};
```

#### Task Creation Logic
```typescript
// Handle task creation - refresh data after task is created
const handleTaskCreated = () => {
  // Trigger a refresh of the tasks
  setRefreshData(RefreshData + 1);
};
```

### Resolved TypeScript Issues
1. Fixed ref type issues with React DnD by using `useRef` hooks
2. Added proper type definitions for drag and drop components
3. Corrected property names in the UserShortResponse interface
4. Added proper generic types to useDrag and useDrop hooks

## Pending Tasks

### API Integration
- Implement the actual API call to update task board assignments
- Add error handling for API failures

### Additional Features
- Implement task detail view/edit modal
- Add task filtering and search
- Add task sorting within columns
- Implement task checklist items

### Optimizations
- Add virtualization for better performance with many tasks
- Implement optimistic UI updates with rollback on API failure
- Add keyboard navigation for accessibility

## How to Resume Development
To continue development on this feature:

1. **Review the current implementation** in `/src/app/(pages)/kanban/page.tsx`
2. **Implement the API integration** by updating the `handleMoveTask` function to use the `UpdateTaskBoard` API call
3. **Enhance the UI** with additional features like filtering, sorting, and detailed views

## File Structure
- `/src/app/(pages)/kanban/page.tsx` - Main Kanban board implementation
- `/src/app/services/useTasks.ts` - Task-related API services
- `/src/app/services/useUsers.ts` - User-related API services

## Dependencies
- React DnD for drag and drop functionality
- Chakra UI for component styling
- React hooks for state management
