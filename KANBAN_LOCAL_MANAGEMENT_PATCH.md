# Kanban Local Task Management - Step by Step Implementation

## Problem
Currently, moving tasks within the same board doesn't handle index ordering correctly and immediately calls the API. We need to manage index locally first.

## Solution Overview
1. Create a new local task management function
2. Improve index calculation for precise positioning
3. Update the drag and drop handlers to use local management
4. Add option to persist changes later

## Step 1: Add New Functions

Add these functions after line 4044 (after `handleMoveTaskInternal(taskId, newBoardId, indexTask);`):

```typescript
// LOCAL TASK MANAGEMENT - Handle task reordering locally without API calls
const handleMoveTaskLocal = (
  taskId: string,
  newBoardId: string,
  newIndex?: number
): boolean => {
  console.log(`🔄 LOCAL MOVE: Task ${taskId} to board ${newBoardId} at index ${newIndex}`);

  try {
    // Find the task and target board
    const taskToMove = DataTasks.find((task) => task.id === taskId);
    const targetBoard = DataBoard.find((board) => board.id === newBoardId);

    if (!taskToMove || !targetBoard) {
      console.error("❌ Task or board not found");
      return false;
    }

    // Check if it's the same board - handle differently for same board moves
    const isSameBoard = taskToMove.boardId === newBoardId;
    
    // Get tasks in the target board (excluding the task being moved)
    const tasksInTargetBoard = DataTasks.filter(
      (task) => task.boardId === newBoardId && task.id !== taskId
    ).sort((a, b) => a.indexTask - b.indexTask);

    let calculatedIndex = 0;

    // Calculate the new index based on position
    if (typeof newIndex === "number") {
      // Use provided index directly for precise positioning
      calculatedIndex = newIndex;
      console.log(`📍 Using provided index: ${calculatedIndex}`);
    } else {
      // Default to end of board
      if (tasksInTargetBoard.length > 0) {
        const highestIndex = Math.max(
          ...tasksInTargetBoard.map((task) => task.indexTask)
        );
        calculatedIndex = highestIndex + 10;
      } else {
        calculatedIndex = 10;
      }
      console.log(`📍 Calculated end index: ${calculatedIndex}`);
    }

    // Update local state immediately (optimistic update)
    setDataTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            boardId: newBoardId,
            boardName: targetBoard.boardName,
            boardIndexStage: targetBoard.indexStage,
            boardCodeStage: targetBoard.boardCodeStage,
            indexTask: calculatedIndex,
          };
        }
        return task;
      });

      // Sort tasks to ensure proper order
      return updatedTasks.sort((a, b) => {
        if (a.boardId !== b.boardId) {
          return a.boardId.localeCompare(b.boardId);
        }
        return a.indexTask - b.indexTask;
      });
    });

    // Visual feedback
    setRecentlyMovedTaskId(taskId);
    setTimeout(() => {
      setRecentlyMovedTaskId(null);
    }, 1500);

    // Show different messages for same board vs cross board moves
    if (isSameBoard) {
      console.log(`✅ LOCAL MOVE: Task reordered within ${targetBoard.boardName}`);
    } else {
      console.log(`✅ LOCAL MOVE: Task moved to ${targetBoard.boardName}`);
    }
    
    return true;

  } catch (error) {
    console.error("❌ LOCAL MOVE ERROR:", error);
    return false;
  }
};

// IMPROVED INDEX CALCULATION for precise positioning
const calculatePreciseIndex = (
  targetBoardId: string,
  insertPosition: number,
  excludeTaskId?: string
): number => {
  // Get tasks in target board (excluding the task being moved)
  const boardTasks = DataTasks.filter(
    (task) => task.boardId === targetBoardId && task.id !== excludeTaskId
  ).sort((a, b) => a.indexTask - b.indexTask);

  console.log(`📊 Board ${targetBoardId} has ${boardTasks.length} tasks`);
  console.log(`📍 Insert position: ${insertPosition}`);

  // If empty board
  if (boardTasks.length === 0) {
    console.log(`📍 Empty board, using index: 10`);
    return 10;
  }

  // If inserting at the beginning
  if (insertPosition <= 0) {
    const firstIndex = boardTasks[0].indexTask;
    const newIndex = Math.max(1, firstIndex - 10);
    console.log(`📍 Beginning insertion, using index: ${newIndex}`);
    return newIndex;
  }

  // If inserting at the end
  if (insertPosition >= boardTasks.length) {
    const lastIndex = boardTasks[boardTasks.length - 1].indexTask;
    const newIndex = lastIndex + 10;
    console.log(`📍 End insertion, using index: ${newIndex}`);
    return newIndex;
  }

  // If inserting in the middle
  const prevTask = boardTasks[insertPosition - 1];
  const nextTask = boardTasks[insertPosition];
  
  if (prevTask && nextTask) {
    const gap = nextTask.indexTask - prevTask.indexTask;
    
    if (gap > 2) {
      // Enough space, use midpoint
      const newIndex = Math.floor((prevTask.indexTask + nextTask.indexTask) / 2);
      console.log(`📍 Middle insertion with gap ${gap}, using index: ${newIndex}`);
      return newIndex;
    } else {
      // Not enough space, need to reindex
      console.log(`📍 Insufficient gap (${gap}), need reindexing`);
      return reindexBoard(targetBoardId, insertPosition, excludeTaskId);
    }
  }

  // Fallback
  console.log(`📍 Fallback, using index: ${insertPosition * 10 + 10}`);
  return insertPosition * 10 + 10;
};

// REINDEX BOARD when there's not enough space between tasks
const reindexBoard = (
  boardId: string,
  insertPosition: number,
  excludeTaskId?: string
): number => {
  console.log(`🔄 Reindexing board ${boardId} for insert position ${insertPosition}`);
  
  const boardTasks = DataTasks.filter(
    (task) => task.boardId === boardId && task.id !== excludeTaskId
  ).sort((a, b) => a.indexTask - b.indexTask);

  // Calculate new indices with proper spacing
  const spacing = 10;
  const newIndex = (insertPosition + 1) * spacing;

  // Update all tasks in this board with new indices
  setDataTasks((prevTasks) => {
    return prevTasks.map((task) => {
      if (task.boardId === boardId && task.id !== excludeTaskId) {
        const taskPosition = boardTasks.findIndex(t => t.id === task.id);
        let newTaskIndex;
        
        if (taskPosition < insertPosition) {
          // Tasks before insertion point
          newTaskIndex = (taskPosition + 1) * spacing;
        } else {
          // Tasks after insertion point (shift by 1)
          newTaskIndex = (taskPosition + 2) * spacing;
        }
        
        return { ...task, indexTask: newTaskIndex };
      }
      return task;
    });
  });

  console.log(`✅ Reindexing complete, new task index: ${newIndex}`);
  return newIndex;
};
```

## Step 2: Update DroppableBoard Component

Find the `drop` handler in the `DroppableBoard` component (around line 3730) and replace the existing drop logic with:

```typescript
drop: (item, monitor) => {
  // Clear the drop preview
  if (setDropPreview) {
    setDropPreview(null);
  }

  // Get the client offset to determine drop position
  const clientOffset = monitor.getClientOffset();

  if (clientOffset && dropRef.current) {
    // Sort tasks by their current index (excluding the dragged task)
    const boardTasks = tasks.filter(task => task.id !== item.id)
      .sort((a: TaskViewModel, b: TaskViewModel) => a.indexTask - b.indexTask);

    // Get all task card elements in this board
    const taskElements = Array.from(
      dropRef.current.querySelectorAll(".task-card")
    );

    let insertPosition = 0;

    // If there are no tasks in this board, insert at position 0
    if (taskElements.length === 0) {
      console.log(`Dropping at beginning of empty board ${board.id}`);
      insertPosition = 0;
    } else {
      // Find where the task should be inserted based on cursor position
      insertPosition = boardTasks.length; // Default to end

      for (let i = 0; i < taskElements.length; i++) {
        const taskElement = taskElements[i];
        const rect = taskElement.getBoundingClientRect();

        // If cursor is above the middle of this task, insert before it
        if (clientOffset.y < rect.top + rect.height / 2) {
          insertPosition = i;
          break;
        }
      }
    }

    // Calculate precise index using the improved function
    const preciseIndex = calculatePreciseIndex(board.id, insertPosition, item.id);

    console.log(
      `🎯 Dropping task ${item.id} at position ${insertPosition} with index ${preciseIndex}`
    );

    // Use local move function instead of API call
    handleMoveTaskLocal(item.id, board.id, preciseIndex);
  }
},
```

## Step 3: Update Component Props

Find the `DroppableBoard` components (around line 4574) and update the props:

```typescript
<DroppableBoard
  key={board.id}
  board={board}
  tasks={DataTasks.filter((task) => task.boardId === board.id)}
  onMoveTask={handleMoveTask}
  onPositionedMove={handleMoveTaskLocal} // Changed from handleMoveTaskInternal
  setDropPreview={setDropPreview}
>
```

And update the `DraggableTaskCard` components (around line 4657):

```typescript
<DraggableTaskCard
  task={task}
  onMoveTask={handleMoveTask}
  onPositionedMove={handleMoveTaskLocal} // Changed from handleMoveTaskInternal
  isRecentlyMoved={task.id === recentlyMovedTaskId}
  DataProject={DataProject}
/>
```

## Step 4: Test the Changes

1. Save the file
2. Test moving tasks within the same board
3. Check the console logs to see the improved index calculation
4. Verify that tasks maintain their order correctly

## Step 5: Optional - Add Save Button (Future Enhancement)

You can later add a "Save Changes" button to persist all local changes to the API:

```typescript
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

const saveAllChanges = async () => {
  // Batch API calls to save all local changes
  // Implementation depends on your API design
};
```

## Benefits of This Approach

1. **Immediate Feedback**: Tasks move instantly without waiting for API calls
2. **Better Index Management**: Precise positioning with gap detection and reindexing
3. **Same Board Support**: Properly handles reordering within the same board
4. **Error Resilience**: Local changes aren't lost if API calls fail
5. **Performance**: Reduces API calls and improves user experience

## Next Steps

After implementing these changes, you can:
1. Test the local movement functionality
2. Add batch save functionality
3. Add visual indicators for unsaved changes
4. Implement conflict resolution for concurrent edits
