"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import SidebarWithHeader from "@/app/components/sidebar";
import { radiusStyle } from "@/app/constants/applicationConstants";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Heading,
  HStack,
  Stack,
  StackDivider,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Kanban Example",
  breadCrumb: ["Home", "Kanban"],
};

interface Task {
  id: number;
  text: string;
  index: number;
}

function KanbanPage() {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedItemStyle, setDraggedItemStyle] = useState<any>({});
  const [todoTasks, setTodoTasks] = useState<Task[]>([
    { id: 1, text: "Task 1", index: 0 },
    { id: 2, text: "Task 2", index: 1 },
  ]);

  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);

  const [isHovered, setIsHovered] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (task: Task, e: React.DragEvent) => {
    console.log("handleDragStart");
    setDraggedTask(task);
    setDraggedIndex(task.index); // Track the dragged task's index
    const { clientX, clientY } = e;
    setDraggedItemStyle({
      position: "absolute",
      left: clientX - 50 + "px",
      top: clientY - 25 + "px",
      pointerEvents: "none",
      zIndex: 1000,
      opacity: 1,
    });
    // e.dataTransfer.setData("text/plain", task.id.toString());
  };

  const handleDragMove = (e: React.DragEvent) => {
    if (!draggedTask) return;
    const { clientX, clientY } = e;
    setDraggedItemStyle({
      ...draggedItemStyle,
      left: clientX - 50 + "px",
      top: clientY - 25 + "px",
    });
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedItemStyle({});
    setDraggedIndex(null); // Reset dragged index after drag ends
  };

  const handleDrop = (
    targetList: "todo" | "inProgress",
    e: React.DragEvent
  ) => {
    console.log("handleDrop");
    if (!draggedTask) return;

    const targetTasks = targetList === "todo" ? todoTasks : inProgressTasks;

    // Get the index of the task where the drag ends
    const { clientY } = e;
    let newIndex = -1;
    let taskBoundingRects = targetTasks.map((task) => {
      const taskElement = document.getElementById(`task-${task.id}`);
      return taskElement ? taskElement.getBoundingClientRect() : null;
    });

    taskBoundingRects.forEach((rect, idx) => {
      if (rect && clientY >= rect.top && clientY <= rect.bottom) {
        newIndex = idx;
      }
    });

    if (newIndex === -1) {
      newIndex = targetTasks.length;
    }

    // Update task lists by inserting the dragged task at the correct index
    const updatedTargetTasks = [...targetTasks];
    updatedTargetTasks.splice(newIndex, 0, draggedTask);

    if (targetList === "todo") {
      setTodoTasks(updatedTargetTasks);
      setInProgressTasks(
        inProgressTasks.filter((task) => task.id !== draggedTask.id)
      );
    } else {
      setInProgressTasks(updatedTargetTasks);
      setTodoTasks(todoTasks.filter((task) => task.id !== draggedTask.id));
    }

    setDraggedTask(null);
    setIsHovered(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allows drop
    setIsHovered(true);
  };

  const handleDragLeave = () => {
    setIsHovered(false);
  };

  return (
    <SidebarWithHeader>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />
      <Stack p={4} rounded={radiusStyle} minH={"80vh"}>
        <Flex justify="space-around" p={6} position="relative">
          {/* To-Do Tasks */}
          <VStack
            w="45%"
            bg="gray.50"
            p={4}
            borderRadius="md"
            boxShadow="md"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop("todo", e)}
            onDragLeave={handleDragLeave}
            position="relative"
            transition="all 0.3s ease"
            border={isHovered ? "2px dashed blue" : "none"}
          >
            <Heading size="md" mb={4}>
              To Do
            </Heading>
            {todoTasks
              .sort((a, b) => a.index - b.index)
              .map((task) => (
                <Box
                  key={`todo-${task.id}`}
                  id={`task-${task.id}`} // Add an id for each task for positioning
                  w="100%"
                  p={4}
                  bg="blue.100"
                  borderRadius="md"
                  mb={2}
                  draggable
                  onDragStart={(e) => handleDragStart(task, e)}
                  onDragEnd={handleDragEnd}
                >
                  <Text>{task.text}</Text>
                </Box>
              ))}
          </VStack>

          {/* In-Progress Tasks */}
          <VStack
            w="45%"
            bg="gray.50"
            p={4}
            borderRadius="md"
            boxShadow="md"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop("inProgress", e)}
            onDragLeave={handleDragLeave}
            position="relative"
            transition="all 0.3s ease"
            border={isHovered ? "2px dashed green" : "none"}
          >
            <Heading size="md" mb={4}>
              In Progress
            </Heading>
            {inProgressTasks
              .sort((a, b) => a.index - b.index)
              .map((task) => (
                <Box
                  key={`inProgress-${task.id}`}
                  id={`task-${task.id}`} // Add an id for each task for positioning
                  w="100%"
                  p={4}
                  bg="green.100"
                  borderRadius="md"
                  mb={2}
                  draggable
                  onDragStart={(e) => handleDragStart(task, e)}
                  onDragEnd={handleDragEnd}
                >
                  <Text>{task.text}</Text>
                </Box>
              ))}
          </VStack>

          {/* Clone of the Dragged Item (appears solid and follows cursor) */}
          {draggedTask && (
            <Box
              style={draggedItemStyle}
              bg="yellow.100"
              p={4}
              borderRadius="md"
              boxShadow="lg"
              zIndex={100}
            >
              <Text>{draggedTask.text}</Text>
            </Box>
          )}
        </Flex>
      </Stack>
    </SidebarWithHeader>
  );
}

// function KanbanPage() {
//   const [KanbanData, setKanbanData] = useState<PostContentProps>(initialValue);

//   return (
//     <SidebarWithHeader>
//       <HeaderContent
//         titleName={HeaderDataContent.titleName}
//         breadCrumb={HeaderDataContent.breadCrumb}
//       />
//       <Stack p={4} rounded={radiusStyle} minH={"80vh"}>
//         <Heading as="h4" size="md">
//           {KanbanData.contentName.toLocaleUpperCase()} #{KanbanData.contentCode}
//         </Heading>
//         <Flex
//           as={HStack}
//           h={"full"}
//           bg={"primary.200"}
//           p={5}
//           alignItems={"start"}
//           justifyContent={"start"}
//           overflowX="auto"
//           whiteSpace="nowrap"
//           spacing={4}
//           rounded={radiusStyle}
//         >
//           {KanbanData.contentColumns.map((colmn, index) => (
//             <PostColumn key={index} {...colmn} />
//           ))}
//         </Flex>
//       </Stack>
//     </SidebarWithHeader>
//   );
// }

// const PostColumn = ({
//   columnId,
//   columnCode,
//   columnIndex,
//   columnName,
//   columnPosts,
// }: PostColumnProps) => {
//   return (
//     <Flex
//       as={Stack}
//       direction="column"
//       spacing={4}
//       width={{ base: "full", md: "350px" }}
//       flexShrink={0}
//       bg={"primary.100"}
//       rounded={radiusStyle}
//       p={3}
//     >
//       <Box px={4} py={2}>
//         <Heading as="h4" size="md">
//           {columnName} - #{columnCode}
//         </Heading>
//       </Box>
//       {columnPosts.map((task, index) => (
//         <PostCard key={index} {...task} />
//       ))}
//     </Flex>
//   );
// };

// const PostCard = ({
//   taskId,
//   taskCode,
//   taskName,
//   taskDesc,
//   taskIndex,
// }: PostCardProps) => {
//   return (
//     <Card rounded={radiusStyle} flexShrink={0} boxShadow={"md"}>
//       <CardBody p={5}>
//         <Heading size="sm" textTransform="uppercase">
//           {taskName} - #{taskCode}
//         </Heading>
//         <Text pt="2" fontSize="sm" whiteSpace="normal">
//           {taskDesc}
//         </Text>
//       </CardBody>
//     </Card>
//   );
// };

// {
//   <Box px={4} py={2} fontSize={"xs"} overflowX="auto">
//   <pre>{JSON.stringify(cards, null, 2)}</pre>
// </Box>
// }

export default KanbanPage;
