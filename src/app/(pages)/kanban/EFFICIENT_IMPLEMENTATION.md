# Efficient Kanban Implementation - Refresh Approach

## Replace the `handleMoveTaskInternal` function with this more efficient version:

```typescript
const handleMoveTaskInternal = async (
  taskId: string,
  newBoardId: string,
  newIndex?: number
): Promise<boolean> => {
  setIsLoadingProcess(true);

  try {
    // Find the task and target board
    const taskToMove = DataTasks.find((task) => task.id === taskId);
    const targetBoard = DataBoard.find((board) => board.id === newBoardId);

    if (!taskToMove || !targetBoard) {
      console.error("Task or board not found");
      return false;
    }

    const isMovingWithinSameBoard = taskToMove.boardId === newBoardId;
    
    let indexTask = 0;

    if (isMovingWithinSameBoard) {
      // SAME BOARD REORDERING LOGIC - SIMPLIFIED
      console.log("Moving within same board - using provided index");
      
      // For same board moves, use the provided index directly
      // The server will handle proper reordering of other tasks
      if (typeof newIndex === "number") {
        indexTask = newIndex;
      } else {
        // Default to a middle value if no index provided
        indexTask = 50;
      }
      
      console.log(`Same board move: using index ${indexTask}`);
      
    } else {
      // DIFFERENT BOARD LOGIC (existing logic)
      const tasksInTargetBoard = DataTasks.filter(
        (task) => task.boardId === newBoardId
      ).sort((a, b) => a.indexTask - b.indexTask);

      if (typeof newIndex === "number") {
        indexTask = newIndex;
        console.log(`Using provided index: ${indexTask}`);
      } else if (tasksInTargetBoard.length > 0) {
        const highestIndex = Math.max(
          ...tasksInTargetBoard.map((task) => task.indexTask)
        );
        indexTask = highestIndex + 10;
        console.log(`Calculated end index: ${indexTask}`);
      } else {
        indexTask = 10;
        console.log(`Using default index: ${indexTask}`);
      }
    }

    console.log(`Moving task ${taskId} to board ${newBoardId} at index ${indexTask}`);

    // Single API call to move the task
    const moveTaskPayload: TaskMovePayload = {
      id: taskId,
      boardId: newBoardId,
      indexTask: indexTask,
      indexStage: targetBoard.indexStage,
    };

    const response = await MoveTask(moveTaskPayload, tokenData);
    
    if (response?.statusCode !== RES_CODE_OK) {
      throw new Error(response?.message || "Failed to move task");
    }

    // Instead of complex state updates, just refresh the task list
    console.log("Task moved successfully, refreshing task list...");
    
    // Trigger refresh of the task list to get updated data from server
    setRefreshData(RefreshData + 1);

    // Set recently moved task for visual feedback
    setRecentlyMovedTaskId(taskId);

    // Clear the highlight after 2 seconds
    setTimeout(() => {
      setRecentlyMovedTaskId(null);
    }, 2000);

    showToast({
      description: isMovingWithinSameBoard 
        ? "Task reordered successfully" 
        : `Task moved to ${targetBoard.boardName}`,
      statusToast: "success",
    });

    return true;

  } catch (error) {
    console.error("Error moving task:", error);
    showToast({
      description: "An error occurred while moving the task",
      statusToast: "error",
    });
    return false;
  } finally {
    setIsLoadingProcess(false);
  }
};
```

## Key Improvements:

### 1. **Simplified Logic**
- Single API call instead of batch updates
- Server handles the reordering logic
- Client just triggers a refresh

### 2. **Better Performance**
- Reduced network calls
- Faster execution
- Less client-side processing

### 3. **Server-Side Reordering**
Your server should handle the reordering logic when it receives a task move request:

```typescript
// Server-side logic (for reference)
// When moving a task within the same board:
// 1. Update the moved task's index
// 2. Automatically reorder other tasks if needed
// 3. Return success response
// 4. Client refreshes to get updated data
```

### 4. **Refresh Trigger**
The `setRefreshData(RefreshData + 1)` will trigger the existing `useEffect` that calls:
- `GetListTasks()` - Refreshes the task list with updated positions

## Benefits:
- ✅ **Performance**: Single API call + refresh
- ✅ **Consistency**: Server ensures proper ordering
- ✅ **Simplicity**: Less complex client logic
- ✅ **Reliability**: Server is source of truth
- ✅ **Maintainability**: Easier to debug and modify

## Server Expectation:
Your server should handle the index recalculation automatically when receiving a move request within the same board, ensuring all tasks have proper sequential indices.

This approach is much more efficient and follows the principle of letting the server handle data consistency while the client focuses on UI interactions.
