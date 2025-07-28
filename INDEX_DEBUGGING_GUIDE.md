# 🔍 Index Calculation Debugging Guide

## 🚨 **Problem:**
- Task moves to correct position locally ✅
- API call succeeds ✅  
- But on page reload, task returns to original position ❌
- **Root Cause:** Wrong index value sent to API

## 🧪 **Debugging Steps:**

### **Step 1: Test Task Movement**
1. **Open browser console** (F12)
2. **Drag a task** to a new position
3. **Look for these debug messages:**

```
🚨 DEBUG: handleMoveTaskLocal CALLED!
🚨 DEBUG: Parameters: {taskId: "...", newBoardId: "...", newIndex: ...}
🚨 DEBUG: About to add pending change with finalIndex: [number]
🚨 DEBUG: Task being moved: [task name]
🚨 DEBUG: Target board: [board name]
🚨 DEBUG: Original task index: [original index]
🚨 DEBUG: New calculated index: [new index]
```

### **Step 2: Check Payload Creation**
4. **Continue watching console**
5. **Look for payload creation messages:**

```
🚨 DEBUG: addPendingTaskChange CALLED!
🚨 DEBUG: Parameters: {taskId: "...", boardId: "...", newIndex: ...}
🚨 DEBUG: Creating TaskMovePayload with:
🚨 DEBUG: - id: [task id]
🚨 DEBUG: - boardId: [board id]
🚨 DEBUG: - indexTask (new): [calculated index]
🚨 DEBUG: - indexStage: [stage index]
```

### **Step 3: Test Manual Save**
6. **Click the Save button**
7. **Watch Network tab** for the API request
8. **Check the request payload** in Network tab

### **Step 4: Check API Response**
9. **Look at the API response** in Network tab
10. **Note if the API returns success**
11. **Check if there are any error messages**

### **Step 5: Reload and Compare**
12. **Refresh the page**
13. **Check if task is in the new position**
14. **Compare original vs new index values**

## 🎯 **What to Report:**

Please provide these details:

### **A. Index Values:**
- **Original task index:** [from debug log]
- **Calculated new index:** [from debug log]  
- **Index sent to API:** [from Network tab payload]

### **B. Task Position:**
- **Where you dragged the task:** (e.g., "from position 2 to position 5")
- **Expected behavior:** (e.g., "should be between Task A and Task B")
- **Actual behavior after reload:** (e.g., "back to original position")

### **C. API Details:**
- **API response status:** (e.g., "200 OK")
- **API response message:** (e.g., "success" or error message)
- **Request payload:** (copy from Network tab)

### **D. Board Context:**
- **How many tasks in the board:** [number]
- **Task indices before move:** [list of current indices]
- **Expected task indices after move:** [what they should be]

## 🔧 **Possible Issues:**

### **Issue 1: Index Calculation Wrong**
**Symptoms:** Calculated index doesn't match expected position
**Cause:** Algorithm for calculating index between tasks is incorrect
**Fix:** Adjust index calculation logic

### **Issue 2: API Expects Different Index System**
**Symptoms:** Index sent looks correct but API doesn't use it properly
**Cause:** API might expect 0-based vs 1-based indexing, or different sorting
**Fix:** Adjust index format for API compatibility

### **Issue 3: Board/Stage Index Wrong**
**Symptoms:** Task moves but to wrong board or stage
**Cause:** `indexStage` or `boardId` incorrect in payload
**Fix:** Verify board and stage identification

### **Issue 4: Race Condition with Other Tasks**
**Symptoms:** Task moves but other tasks shift unexpectedly
**Cause:** Other tasks' indices not updated properly
**Fix:** Ensure all affected tasks get updated indices

## 🚀 **Next Steps:**

1. **Run the debugging** and collect the information above
2. **Report the index values** and API details
3. **I'll analyze** the index calculation and fix the algorithm
4. **Test the fix** to ensure proper persistence

## 🎯 **Expected Fix:**

Once we identify the index calculation issue, the fix will ensure:
- **✅ Correct index calculation** for target position
- **✅ Proper API payload** with right index values  
- **✅ Persistent positioning** after page reload
- **✅ Consistent task ordering** in the database

**Let's debug this step by step to find the exact index calculation issue!** 🔍
