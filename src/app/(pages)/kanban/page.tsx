"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import SidebarWithHeader from "@/app/components/sidebar";
import {
  boardDoneLabel,
  boardInProgressLabel,
  boardToDoLabel,
  radiusStyle,
} from "@/app/constants/applicationConstants";
import { truncateText } from "@/app/helper/MasterHelper";
import {
  Avatar,
  AvatarGroup,
  Badge,
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
import { setIn } from "formik";
import { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { FaCommentDots, FaGripVertical } from "react-icons/fa6";
import { LuGrip } from "react-icons/lu";

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
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [todoTasks, setTodoTasks] = useState<Task[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [doneTask, setDoneTasks] = useState<Task[]>([]);

  const [isHovered, setIsHovered] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isLoading, setisLoading] = useState<boolean>(false);

  useEffect(() => {
    delay(500);
    setTodoTasks([
      { id: 1, text: "Task 1", index: 0 },
      { id: 2, text: "Task 2", index: 1 },
      { id: 3, text: "Task 3", index: 2 },
      { id: 4, text: "Task 4", index: 3 },
    ]);
    setInProgressTasks([
      { id: 5, text: "Task 5", index: 0 },
      { id: 6, text: "Task 6", index: 1 },
    ]);
    setDoneTasks([]);
  }, []);

  const handleDragStart = (task: Task, e: React.DragEvent) => {
    setDraggedTask(task);
    setDraggedIndex(task.index); // Track the dragged task's index
  };

  const handleDragMove = (e: React.DragEvent) => {
    if (!draggedTask) return;
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedIndex(null); // Reset dragged index after drag ends
  };

  const handleDrop = (
    targetList: "toDo" | "inProgress" | "done",
    e: React.DragEvent
  ) => {
    const taskLists = {
      toDo: todoTasks,
      inProgress: inProgressTasks,
      done: doneTask,
    };
    if (!draggedTask) return;

    const targetTasks = taskLists[targetList] || doneTask; // Default to doneTask if targetList is not a key

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

    if (targetList === boardToDoLabel) {
      if (todoTasks.filter((task) => task.id === draggedTask.id).length <= 0) {
        // if same task is found in todoTasks then remove from todoTasks
        setTodoTasks(updatedTargetTasks);
        setInProgressTasks(
          inProgressTasks.filter((task) => task.id !== draggedTask.id)
        );
        updateTaskIndex(draggedTask.id, newIndex, setInProgressTasks);
        setDoneTasks(doneTask.filter((task) => task.id !== draggedTask.id));
        updateTaskIndex(draggedTask.id, newIndex, setDoneTasks);
      } else {
        // if same task is not found in todoTasks then remove from inProgressTasks
        updateTaskIndex(draggedTask.id, newIndex, setTodoTasks);
      }
    }

    if (targetList === boardInProgressLabel) {
      if (
        inProgressTasks.filter((task) => task.id === draggedTask.id).length <= 0
      ) {
        // if same task is found in todoTasks then remove from todoTasks
        setInProgressTasks(updatedTargetTasks);
        setTodoTasks(todoTasks.filter((task) => task.id !== draggedTask.id));
        updateTaskIndex(draggedTask.id, newIndex, setTodoTasks);
        setDoneTasks(doneTask.filter((task) => task.id !== draggedTask.id));
        updateTaskIndex(draggedTask.id, newIndex, setDoneTasks);
      } else {
        // if same task is not found in todoTasks then remove from inProgressTasks
        updateTaskIndex(draggedTask.id, newIndex, setInProgressTasks);
      }
    }

    if (targetList === boardDoneLabel) {
      if (doneTask.filter((task) => task.id === draggedTask.id).length <= 0) {
        // if same task is found in todoTasks then remove from todoTasks
        setDoneTasks(updatedTargetTasks);
        setTodoTasks(todoTasks.filter((task) => task.id !== draggedTask.id));
        updateTaskIndex(draggedTask.id, newIndex, setTodoTasks);
        setInProgressTasks(
          inProgressTasks.filter((task) => task.id !== draggedTask.id)
        );
        updateTaskIndex(draggedTask.id, newIndex, setInProgressTasks);
      } else {
        // if same task is not found in todoTasks then remove from inProgressTasks
        updateTaskIndex(draggedTask.id, newIndex, setDoneTasks);
      }
    }

    setDraggedTask(null);
    setIsHovered(false);
  };

  const updateTaskIndex = (
    taskId: number,
    newIndex: number,
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  ) => {
    setTasks((prevTasks) => {
      const taskToMove = prevTasks.find((task) => task.id === taskId);
      if (!taskToMove) return prevTasks; // Task not found

      const newTasks = prevTasks.filter((task) => task.id !== taskId);
      const insertIndex = Math.min(newIndex, newTasks.length); // Prevent index out of bounds

      newTasks.splice(insertIndex, 0, { ...taskToMove, index: newIndex });

      // Rearrange indices of other tasks
      return newTasks.map((task, index) => ({ ...task, index: index }));
    });
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
      <Flex
        as={HStack}
        p={4}
        spacing={8}
        justifyContent={"start"}
        alignItems={"start"}
        rounded={radiusStyle}
        minH={"75vh"}
      >
        {/* To-Do Tasks */}
        <Flex
          as={Stack}
          direction="column"
          spacing={4}
          width={{ base: "full", md: "350px" }}
          bg={"primary.100"}
          rounded={radiusStyle}
          boxShadow={"md"}
          p={5}
          minH={"75vh"}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop("toDo", e)}
          onDragLeave={handleDragLeave}
          transition="all 0.3s ease"
          border={isHovered ? "2px dashed blue" : "none"}
        >
          <Heading size="md" mb={4}>
            To Do
          </Heading>
          {todoTasks
            .sort((a, b) => a.index - b.index)
            .map((task) => (
              <Task
                key={task.id} // Important: Add a key prop here!
                task={task}
                handleDragStart={handleDragStart}
                handleDragEnd={handleDragEnd}
              />
            ))}
        </Flex>

        {/* In-Progress Tasks */}
        <Flex
          as={Stack}
          direction="column"
          spacing={4}
          width={{ base: "full", md: "350px" }}
          bg={"primary.100"}
          rounded={radiusStyle}
          boxShadow={"md"}
          p={5}
          minH={"75vh"}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop("inProgress", e)}
          onDragLeave={handleDragLeave}
          transition="all 0.3s ease"
          border={isHovered ? "2px dashed green" : "none"}
        >
          <Heading size="md" mb={4}>
            In Progress
          </Heading>
          {inProgressTasks
            .sort((a, b) => a.index - b.index)
            .map((task) => (
              <Task
                key={task.id} // Important: Add a key prop here!
                task={task}
                handleDragStart={handleDragStart}
                handleDragEnd={handleDragEnd}
              />
            ))}
        </Flex>

        {/* Done Tasks */}
        <Flex
          as={Stack}
          direction="column"
          spacing={4}
          width={{ base: "full", md: "350px" }}
          bg={"primary.100"}
          rounded={radiusStyle}
          boxShadow={"md"}
          p={5}
          minH={"75vh"}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop("done", e)}
          onDragLeave={handleDragLeave}
          transition="all 0.3s ease"
          border={isHovered ? "2px dashed green" : "none"}
        >
          <Heading size="md" mb={4}>
            Done
          </Heading>
          {doneTask
            .sort((a, b) => a.index - b.index)
            .map((task) => (
              <Task
                key={task.id} // Important: Add a key prop here!
                task={task}
                handleDragStart={handleDragStart}
                handleDragEnd={handleDragEnd}
              />
            ))}
        </Flex>
      </Flex>
    </SidebarWithHeader>
  );
}

interface TaskProps {
  task: {
    id: number;
    text: string;
    index: number;
  };
  handleDragStart: (task: any, event: any) => void;
  handleDragEnd: () => void;
}

const Task: React.FC<TaskProps> = ({
  task,
  handleDragStart,
  handleDragEnd,
}) => {
  return (
    <Flex
      as={VStack}
      key={`todo-${task.id}`}
      id={`task-${task.id}`}
      w={"full"}
      spacing={2}
      p={4}
      // bg="primary.100"
      bg={"white"}
      minH={"70px"}
      rounded={radiusStyle}
      draggable
      onDragStart={(e) => handleDragStart(task, e)}
      onDragEnd={handleDragEnd}
    >
      <Flex
        as={HStack}
        w={"full"}
        justifyContent={"space-between"}
        alignItems={"center"}
        cursor={"grab"}
      >
        <Badge colorScheme="red" rounded={radiusStyle} px={2}>
          Critical
        </Badge>
      </Flex>
      <Flex
        as={VStack}
        w={"full"}
        justifyContent={"start"}
        alignItems={"start"}
        minH={"40px"}
        spacing={0}
      >
        <Text fontWeight={600} fontSize={18}>
          {task.text}
        </Text>
        <Text
          fontWeight={"normal"}
          color={"gray.600"}
          fontSize={15}
          justifyContent={"space-between"}
        >
          {truncateText(
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus feugiat, vestibulum lorem id, posuere turpis. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh.",
            80
          )}
        </Text>
      </Flex>
      <Flex
        as={HStack}
        w={"full"}
        justifyContent={"space-between"}
        alignItems={"center"}
        h={"full"}
      >
        <Flex
          justifyContent={"space-between"}
          alignItems={"center"}
          h={"full"}
          w={"full"}
        >
          <AvatarGroup
            size={"sm"}
            max={2}
            colorScheme={"blue"}
            color={"gray.500"}
          >
            <Avatar name="Ryan Florence" bg={"blue.500"} />
            <Avatar name="Prosper Otemuyiwa" bg={"blue.200"} />
            <Avatar name="Christian Nwamba" bg={"blue.100"} />
          </AvatarGroup>
          <Flex
            as={HStack}
            justifyContent={"center"}
            alignItems={"center"}
            h={"full"}
            color={"gray.500"}
            cursor={"grab"}
            spacing={1.5}
          >
            <FaCommentDots size={16} />
            <Text fontSize={17} fontWeight={"semibold"}>
              50
            </Text>
            <FaCheckCircle size={16} />
            <Text fontSize={17} fontWeight={"semibold"}>
              4
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

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
