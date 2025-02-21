"use client";

import { HorizontalFadeDivider } from "@/app/components/divider";
import { DropZoneComponent } from "@/app/components/dropzone";
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
import { generateUUIDV1, truncateText } from "@/app/helper/MasterHelper";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  StackDivider,
  Text,
  Textarea,
  useDisclosure,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { setIn } from "formik";
import { u } from "framer-motion/client";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaCog } from "react-icons/fa";
import {
  FaCommentDots,
  FaEllipsisVertical,
  FaGripVertical,
  FaPlus,
} from "react-icons/fa6";
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
  const [RefreshAction, setRefreshAction] = useState(0);

  useEffect(() => {
    setisLoading(true);
    delay(1000);
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
    setisLoading(false);
  }, [RefreshAction]);

  const handleRefresh = () => {
    setRefreshAction(RefreshAction + 1);
  };

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
      <Box px={4}>
        <Button onClick={handleRefresh} colorScheme={"primary"}>
          Refresh
        </Button>
      </Box>

      <Box p={4}>
        <Wrap spacing={4} minH={"75vh"}>
          <WrapItem width={{ base: "full", md: "350px" }}>
            {/* To-Do Tasks */}
            <Flex
              as={Stack}
              direction="column"
              spacing={4}
              width={"full"}
              bg={"white"}
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
              <Flex
                w={"full"}
                h={"50vh"}
                justifyContent={"center"}
                alignItems={"center"}
                display={isLoading ? "flex" : "none"}
              >
                <Spinner />
              </Flex>
            </Flex>
          </WrapItem>
          <WrapItem width={{ base: "full", md: "350px" }}>
            {/* In-Progress Tasks */}
            <Flex
              as={Stack}
              direction="column"
              spacing={4}
              width={"full"}
              bg={"white"}
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
              <Flex
                w={"full"}
                h={"50vh"}
                justifyContent={"center"}
                alignItems={"center"}
                display={isLoading ? "flex" : "none"}
              >
                <Spinner />
              </Flex>
            </Flex>
          </WrapItem>
          <WrapItem width={{ base: "full", md: "350px" }}>
            {/* Done Tasks */}
            <Flex
              as={Stack}
              direction="column"
              spacing={4}
              width={"full"}
              bg={"white"}
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
              <Flex
                w={"full"}
                h={"50vh"}
                justifyContent={"center"}
                alignItems={"center"}
                display={isLoading ? "flex" : "none"}
              >
                <Spinner />
              </Flex>
            </Flex>
          </WrapItem>
        </Wrap>
      </Box>
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

interface AttachmentProps {
  id: string;
  name: string;
  src: string;
  alt: string;
  extension?: string;
  size?: string;
}

const ImageAttachment: AttachmentProps[] = [
  {
    id: generateUUIDV1(),
    name: "Image 1",
    src: "./img/business/corp-assets-004.jpg",
    alt: "Image 1",
    extension: "jpg",
    size: "1.2MB",
  },
  {
    id: generateUUIDV1(),
    name: "Image 2",
    src: "./img/business/corp-assets-002.jpg",
    alt: "Image 2",
    extension: "jpg",
    size: "1.5MB",
  },
  {
    id: generateUUIDV1(),
    name: "Image 3",
    src: "./img/business/corp-assets-005.jpg",
    alt: "Image 3",
    extension: "jpg",
    size: "1.8MB",
  },
  {
    id: generateUUIDV1(),
    name: "Image 4",
    src: "./img/business/corp-assets-006.jpg",
    alt: "Image 4",
    extension: "jpg",
    size: "2.0MB",
  },
];

interface SubTaskTypes {
  id: number;
  text: string;
  completed: boolean;
}

const SubTasksInit: SubTaskTypes[] = [
  { id: 1, text: "Sub Task 1", completed: false },
  { id: 2, text: "Sub Task 2", completed: true },
  { id: 3, text: "Sub Task 3", completed: false },
  { id: 4, text: "Sub Task 4", completed: true },
];

const Task: React.FC<TaskProps> = ({
  task,
  handleDragStart,
  handleDragEnd,
}) => {
  const TaskModalDisc = useDisclosure();
  const [SubTasks, setSubTasks] = useState<SubTaskTypes[]>(SubTasksInit);

  const handleSubTaskChange = (id: number) => {
    setSubTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <>
      <Flex
        as={VStack}
        key={`todo-${task.id}`}
        id={`task-${task.id}`}
        w={"full"}
        spacing={2}
        p={4}
        // bg="primary.100"
        boxShadow={"lg"}
        border={"1px solid"}
        borderColor={"gray.200"}
        bg={"white"}
        minH={"70px"}
        rounded={radiusStyle}
        draggable
        onDragStart={(e) => handleDragStart(task, e)}
        onDragEnd={handleDragEnd}
        onClick={TaskModalDisc.onOpen}
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
          cursor={"pointer"}
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
      <Modal
        isCentered
        onClose={TaskModalDisc.onClose}
        isOpen={TaskModalDisc.isOpen}
        motionPreset="slideInBottom"
        scrollBehavior={"inside"}
        size={"5xl"}
      >
        <ModalOverlay />
        <ModalContent rounded={radiusStyle} py={4} m={2}>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
              <GridItem colSpan={{ base: 12, sm: 12, md: 8, lg: 8 }}>
                <Flex
                  w={"full"}
                  as={VStack}
                  spacing={4}
                  justifyContent={"start"}
                  alignItems={"start"}
                >
                  <Flex
                    w={"full"}
                    as={VStack}
                    alignItems={"start"}
                    justifyContent={"start"}
                    spacing={2}
                  >
                    <Badge colorScheme="red" rounded={radiusStyle} px={2}>
                      Critical
                    </Badge>
                    <Text fontWeight={600} fontSize={23}>
                      {task.text}
                    </Text>
                  </Flex>
                  <Text
                    justifyContent={"space-between"}
                    alignItems={"start"}
                    w={"full"}
                  >
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                    Voluptate quasi beatae expedita rem iste, laboriosam
                    voluptas rerum dicta quos praesentium magnam, inventore,
                    culpa odit quo ut veniam optio minima labore!
                  </Text>
                  <Flex
                    w={"full"}
                    justifyContent={"start"}
                    as={HStack}
                    spacing={2}
                    color={"gray.500"}
                  >
                    <FaCheckCircle size={16} />
                    <Text fontWeight={600} fontSize={18}>
                      Sub Task ({SubTasks.length})
                    </Text>
                  </Flex>
                  <Flex
                    w={"full"}
                    justifyContent={"start"}
                    alignItems={"start"}
                    as={VStack}
                    spacing={2}
                    color={"gray.700"}
                    px={4}
                  >
                    {SubTasks.map((subTask, index) => (
                      <Checkbox
                        key={index}
                        isChecked={subTask.completed}
                        onChange={() => handleSubTaskChange(subTask.id)}
                        checked={subTask.completed}
                      >
                        <Text as={subTask.completed ? "s" : "p"}>
                          {subTask.text}
                        </Text>
                      </Checkbox>
                    ))}
                  </Flex>
                  <Wrap spacing={2}>
                    {ImageAttachment.map((image, index) => (
                      <WrapItem key={index}>
                        <ImagePreview {...image} />
                      </WrapItem>
                    ))}
                    <WrapItem>
                      <ImageAddMore />
                    </WrapItem>
                  </Wrap>
                  <HorizontalFadeDivider />
                  <Flex
                    w={"full"}
                    justifyContent={"start"}
                    as={HStack}
                    spacing={2}
                    color={"gray.500"}
                  >
                    <FaCommentDots size={16} />
                    <Text fontWeight={600} fontSize={18}>
                      Comments (4)
                    </Text>
                  </Flex>
                  <Flex
                    w={"full"}
                    justifyContent={"start"}
                    as={HStack}
                    spacing={4}
                    color={"gray.500"}
                    p={2}
                  >
                    <Flex
                      justifyContent={"center"}
                      alignItems={"center"}
                      as={VStack}
                      spacing={2}
                    >
                      <Avatar
                        size="md"
                        name="Ryan Florence"
                        src="https://bit.ly/ryan-florence"
                      />
                      {/* <Text fontWeight={600} fontSize={14} textAlign={"center"}>
                        Asep
                      </Text> */}
                    </Flex>
                    <Textarea
                      placeholder="Add a comment"
                      rounded={radiusStyle}
                    />
                  </Flex>
                  {/* Comment Task */}
                  {initialValueComment.map((comment, index) => (
                    <TaskComment key={index} dataComments={comment} />
                  ))}
                </Flex>
              </GridItem>
              <GridItem colSpan={{ base: 12, sm: 12, md: 4, lg: 4 }}>
                <Flex
                  w={"full"}
                  as={VStack}
                  spacing={7}
                  justifyContent={"start"}
                  alignItems={"start"}
                  rounded={radiusStyle}
                  bgColor={"primary.100"}
                  boxShadow={"lg"}
                  minH={"60vh"}
                  p={5}
                  mt={5}
                >
                  <Flex
                    w={"full"}
                    justifyContent={"start"}
                    as={HStack}
                    spacing={2}
                    color={"gray.800"}
                  >
                    <FaCog size={16} />
                    <Text fontWeight={600} fontSize={18}>
                      Options
                    </Text>
                  </Flex>
                </Flex>
              </GridItem>
            </Grid>
          </ModalBody>
          {/* <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={TaskModalDisc.onClose}>
              Close
            </Button>
            <Button variant="ghost">Secondary Action</Button>
          </ModalFooter> */}
        </ModalContent>
      </Modal>
    </>
  );
};

const ImagePreview = ({ name, alt, src }: AttachmentProps) => {
  const ImageModalDisc = useDisclosure();

  return (
    <Box
      rounded={radiusStyle}
      position="relative"
      // boxSize="130px"
      w={{ base: "80px", sm: "80px", md: "100px", lg: "100px" }}
      h={{ base: "80px", sm: "80px", md: "100px", lg: "100px" }}
      cursor="pointer"
      p={1}
      border={"1px solid"}
      borderColor={"gray.300"}
      onClick={() => ImageModalDisc.onOpen()}
      _hover={{
        "& > .previewOverlay": { opacity: 1 },
      }}
    >
      <Image
        rounded={radiusStyle}
        src={src}
        // boxSize="120px"
        w={{ base: "70px", sm: "70px", md: "90px", lg: "90px" }}
        h={{ base: "70px", sm: "70px", md: "90px", lg: "90px" }}
        objectFit="cover"
      />
      {/* Hover overlay */}
      <Box
        rounded={radiusStyle}
        className="previewOverlay"
        position="absolute"
        top={0}
        left={0}
        w="full"
        h="full"
        bg="rgba(0, 0, 0, 0.6)"
        display="flex"
        justifyContent="center"
        alignItems="center"
        opacity={0}
        transition="opacity 0.3s"
      >
        <Text fontSize="lg" fontWeight="light" color="white">
          Preview
        </Text>
      </Box>

      {/* Modal for image preview */}
      <Modal
        isOpen={ImageModalDisc.isOpen}
        onClose={ImageModalDisc.onClose}
        isCentered
        size={"xl"} // Set to "xl" for a more responsive size
      >
        <ModalOverlay />
        <ModalContent
          rounded={radiusStyle}
          maxW="90vw"
          maxH="90vh"
          bg="rgba(255, 255, 255, 0.1)" // Semi-transparent background for glass effect
          backdropFilter="blur(10px)" // Apply blur for frosted glass effect
          boxShadow="lg" // Optionally add shadow to enhance the look
        >
          <ModalCloseButton color={"white"} />
          <ModalBody p={0}>
            <Box
              w="full"
              h="80vh" // Set the height to make it fit within the modal size
              backgroundPosition="center"
              backgroundRepeat="no-repeat"
              backgroundSize="contain" // Ensure the image fits well without stretching
              backgroundImage={`url(${src})`}
              rounded={radiusStyle}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const ImageAddMore = () => {
  const AddImageModalDisc = useDisclosure();
  return (
    <Box
      rounded={radiusStyle}
      position="relative"
      boxSize={{ base: "80px", sm: "80px", md: "100px", lg: "100px" }}
      cursor="pointer"
      p={1}
      border={"1px solid"}
      borderColor={"gray.300"}
      _hover={{
        "& > .previewOverlay": { opacity: 1 },
      }}
    >
      {/* Add Image Placeholder */}
      <Box
        rounded={radiusStyle}
        boxSize={{ base: "70px", sm: "70px", md: "90px", lg: "90px" }}
        display="flex"
        justifyContent="center"
        alignItems="center"
        bg="gray.100" // Placeholder background
        border="2px dashed" // Dashed border to signify 'add' functionality
        color={"primary.300"}
      >
        <FaPlus size={50} />
      </Box>

      {/* Hover overlay */}
      <Box
        rounded={radiusStyle}
        className="previewOverlay"
        position="absolute"
        top={0}
        left={0}
        w="100%"
        h="100%"
        bg="rgba(0, 0, 0, 0.6)"
        display="flex"
        justifyContent="center"
        alignItems="center"
        opacity={0}
        transition="opacity 0.3s"
        onClick={AddImageModalDisc.onOpen}
      >
        <Text fontSize="lg" fontWeight="light" color="white">
          Add New
        </Text>
      </Box>
      {/* Modal for image preview */}
      <Modal
        isOpen={AddImageModalDisc.isOpen}
        onClose={AddImageModalDisc.onClose}
        isCentered
        size={"2xl"} // Set to "xl" for a more responsive size
      >
        <ModalOverlay />
        <ModalContent
          rounded={radiusStyle}
          // bg="rgba(255, 255, 255, 0.1)" // Semi-transparent background for glass effect
          // backdropFilter="blur(10px)" // Apply blur for frosted glass effect
          boxShadow="lg" // Optionally add shadow to enhance the look
        >
          <ModalCloseButton />
          <ModalHeader>Upload Files</ModalHeader>
          <ModalBody p={4}>
            <DropZoneComponent />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const ImagePreviewSM = ({ name, alt, src }: AttachmentProps) => {
  const ImageModalDisc = useDisclosure();

  return (
    <Box
      rounded={radiusStyle}
      position="relative"
      // boxSize="130px"
      w={{ base: "40px", sm: "40px", md: "60px", lg: "60px" }}
      h={{ base: "40px", sm: "40px", md: "60px", lg: "60px" }}
      cursor="pointer"
      p={1}
      border={"1px solid"}
      borderColor={"gray.300"}
      onClick={() => ImageModalDisc.onOpen()}
      _hover={{
        "& > .previewOverlay": { opacity: 1 },
      }}
    >
      <Image
        rounded={radiusStyle}
        src={src}
        // boxSize="120px"
        w={{ base: "30px", sm: "30px", md: "50px", lg: "50px" }}
        h={{ base: "30px", sm: "30px", md: "50px", lg: "50px" }}
        objectFit="cover"
      />
      {/* Hover overlay */}
      <Box
        rounded={radiusStyle}
        className="previewOverlay"
        position="absolute"
        top={0}
        left={0}
        w="full"
        h="full"
        bg="rgba(0, 0, 0, 0.6)"
        display="flex"
        justifyContent="center"
        alignItems="center"
        opacity={0}
        transition="opacity 0.3s"
      >
        <Text fontSize="xs" fontWeight="light" color="white">
          Preview
        </Text>
      </Box>

      {/* Modal for image preview */}
      <Modal
        isOpen={ImageModalDisc.isOpen}
        onClose={ImageModalDisc.onClose}
        isCentered
        size={"xl"} // Set to "xl" for a more responsive size
      >
        <ModalOverlay />
        <ModalContent
          rounded={radiusStyle}
          maxW="90vw"
          maxH="90vh"
          bg="rgba(255, 255, 255, 0.1)" // Semi-transparent background for glass effect
          backdropFilter="blur(10px)" // Apply blur for frosted glass effect
          boxShadow="lg" // Optionally add shadow to enhance the look
        >
          <ModalCloseButton color={"white"} />
          <ModalBody p={0}>
            <Box
              w="full"
              h="80vh" // Set the height to make it fit within the modal size
              backgroundPosition="center"
              backgroundRepeat="no-repeat"
              backgroundSize="contain" // Ensure the image fits well without stretching
              backgroundImage={`url(${src})`}
              rounded={radiusStyle}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const ImageAddMoreSM = () => {
  const AddImageModalDisc = useDisclosure();
  return (
    <Box
      rounded={radiusStyle}
      position="relative"
      boxSize={{ base: "40px", sm: "40px", md: "60px", lg: "60px" }}
      cursor="pointer"
      p={1}
      border={"1px solid"}
      borderColor={"gray.300"}
      _hover={{
        "& > .previewOverlay": { opacity: 1 },
      }}
    >
      {/* Add Image Placeholder */}
      <Box
        rounded={radiusStyle}
        boxSize={{ base: "30px", sm: "30px", md: "50px", lg: "50px" }}
        display="flex"
        justifyContent="center"
        alignItems="center"
        bg="gray.100" // Placeholder background
        border="2px dashed" // Dashed border to signify 'add' functionality
        color={"primary.300"}
      >
        <FaPlus size={20} />
      </Box>

      {/* Hover overlay */}
      <Box
        rounded={radiusStyle}
        className="previewOverlay"
        position="absolute"
        top={0}
        left={0}
        w="100%"
        h="100%"
        bg="rgba(0, 0, 0, 0.6)"
        display="flex"
        justifyContent="center"
        alignItems="center"
        opacity={0}
        transition="opacity 0.3s"
        onClick={AddImageModalDisc.onOpen}
      >
        <Text fontSize="xs" fontWeight="light" color="white">
          Add New
        </Text>
      </Box>
      {/* Modal for image preview */}
      <Modal
        isOpen={AddImageModalDisc.isOpen}
        onClose={AddImageModalDisc.onClose}
        isCentered
        size={"2xl"} // Set to "xl" for a more responsive size
      >
        <ModalOverlay />
        <ModalContent
          rounded={radiusStyle}
          // bg="rgba(255, 255, 255, 0.1)" // Semi-transparent background for glass effect
          // backdropFilter="blur(10px)" // Apply blur for frosted glass effect
          boxShadow="lg" // Optionally add shadow to enhance the look
        >
          <ModalCloseButton />
          <ModalHeader>Upload Files</ModalHeader>
          <ModalBody p={4}>
            <DropZoneComponent />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

interface TaskCommnetProps {
  id: string;
  text: string;
  date: string;
  user: TaskCommentUserProps;
  attachment: AttachmentProps[];
}

interface TaskCommentUserProps {
  id: string;
  name: string;
  avatar?: string | null;
}

const initialValueComment: TaskCommnetProps[] = [
  {
    id: generateUUIDV1(),
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus feugiat, vestibulum lorem id, posuere turpis. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh.",
    date: "2025-02-21 12.00",
    user: {
      id: generateUUIDV1(),
      name: "Ryan Florence",
      avatar: "https://bit.ly/ryan-florence",
    },
    attachment: ImageAttachment,
  },
  {
    id: generateUUIDV1(),
    text: "Aoakwoakwokaw...",
    date: "2025-02-21 12.01",
    user: {
      id: generateUUIDV1(),
      name: "Mus",
      avatar: null,
    },
    attachment: [],
  },
  {
    id: generateUUIDV1(),
    text: "Bjir...",
    date: "2025-02-21 14.00",
    user: {
      id: generateUUIDV1(),
      name: "Mus",
      avatar: null,
    },
    attachment: [],
  },
];

const TaskComment = ({ dataComments }: { dataComments: TaskCommnetProps }) => {
  const limitText: number = 100;
  const [limitTextState, setlimitTextState] = useState<number>(limitText);

  const handleShowMore = () => {
    if (dataComments.text.length > limitTextState) {
      setlimitTextState(dataComments.text.length);
    } else {
      setlimitTextState(limitText);
    }
  };

  return (
    <>
      <Flex
        w={"full"}
        justifyContent={"start"}
        alignItems={"start"}
        as={HStack}
        spacing={2}
        p={2}
      >
        <Avatar size={"md"} name={dataComments.user.name} src={undefined} />
        <Flex as={VStack} spacing={1} alignItems={"start"} w={"full"} pl={3}>
          <Flex
            as={HStack}
            w={"full"}
            justifyContent={"space-between"}
            alignItems={"start"}
          >
            <Flex as={Wrap} spacing={2}>
              <Text fontWeight={600} fontSize={15}>
                {dataComments.user.name}
              </Text>
              <Text fontSize={12} color={"gray.500"} alignSelf={"center"}>
                {dataComments.date}
              </Text>
            </Flex>
            <Button size={"sm"} variant={"ghost"}>
              <FaEllipsisVertical />
            </Button>
          </Flex>
          <Text as={"p"} fontSize={15}>
            {truncateText(dataComments.text, limitTextState)}
          </Text>
          {limitText < dataComments.text.length && (
            <Button
              size={"sm"}
              variant={"link"}
              colorScheme={"primary"}
              onClick={() => handleShowMore()}
            >
              {dataComments.text.length === limitTextState
                ? "Hide Less"
                : "Show More"}
            </Button>
          )}
          <Wrap spacing={2} pt={2}>
            {dataComments.attachment.map((attc, index) => (
              <WrapItem key={index}>
                <ImagePreviewSM {...attc} />
              </WrapItem>
            ))}
            <WrapItem>
              <ImageAddMoreSM />
            </WrapItem>
          </Wrap>
        </Flex>
      </Flex>
    </>
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
