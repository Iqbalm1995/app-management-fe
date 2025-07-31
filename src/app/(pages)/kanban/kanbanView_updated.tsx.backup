// This is the updated version with local task management
// Step 1: Replace the handleMoveTaskInternal function

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

// Step 2: Update the DroppableBoard drop handler to use better index calculation
// This should replace the existing drop handler in DroppableBoard component

const improvedDropHandler = (item: DroppableTaskItem, monitor: any) => {
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
};

// Step 3: Instructions for updating the component

/*
IMPLEMENTATION STEPS:

1. Replace the existing handleMoveTaskInternal function with handleMoveTaskLocal
2. Add the calculatePreciseIndex and reindexBoard helper functions
3. Update the DroppableBoard component's drop handler to use improvedDropHandler
4. Update the component props to use handleMoveTaskLocal instead of handleMoveTaskInternal
5. Add a "Save Changes" button to persist local changes to the API when ready

USAGE:
- Tasks will now move locally without API calls
- Index calculation is more precise and handles edge cases
- Visual feedback is immediate
- You can add a "Save Changes" button later to batch API calls
*/
