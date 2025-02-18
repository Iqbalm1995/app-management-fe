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
  Flex,
  Heading,
  HStack,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { useState } from "react";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Kanban Example",
  breadCrumb: ["Home", "Kanban"],
};

interface PostListContentProps {
  contentCode: string;
  contentTitle: string;
  columnList: PostColumnProps[];
}

interface PostColumnProps {
  columnTitle: string;
  columnPos: number;
  taskList: PostCardProps[];
}

interface PostCardProps {
  taskCode: string;
  taskName: string;
  taskDesc: string;
  taskPos: number;
}

const PostListContent: PostListContentProps = {
  contentCode: "2502",
  contentTitle: "Kanban Board",
  columnList: [
    {
      columnTitle: "To Do",
      columnPos: 1,
      taskList: [
        {
          taskCode: "T001",
          taskName: "Task 1",
          taskDesc: "Task 1 Description",
          taskPos: 1,
        },
        {
          taskCode: "T002",
          taskName: "Task 2",
          taskDesc: "Task 2 Description",
          taskPos: 2,
        },
      ],
    },
    {
      columnTitle: "In Progress",
      columnPos: 2,
      taskList: [
        {
          taskCode: "T003",
          taskName: "Task 3",
          taskDesc: "Task 3 Description",
          taskPos: 1,
        },
      ],
    },
    {
      columnTitle: "Done",
      columnPos: 3,
      taskList: [
        {
          taskCode: "T004",
          taskName: "Task 4",
          taskDesc: "Task 4 Description",
          taskPos: 1,
        },
      ],
    },
  ],
};

function KanbanPage() {
  const [KanbanData, setKanbanData] =
    useState<PostListContentProps>(PostListContent);

  // Handling the drag end event to reorder tasks/columns
  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    // If no destination, do nothing
    if (!destination) return;

    // Dropping in the same spot
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Get the source column
    const startColumn = KanbanData.columnList.find(
      (col) => col.columnTitle === source.droppableId
    )!;
    // Get the destination column
    const finishColumn = KanbanData.columnList.find(
      (col) => col.columnTitle === destination.droppableId
    )!;

    // Moving within the same column
    if (startColumn === finishColumn) {
      const updatedTaskList = Array.from(startColumn.taskList);
      const [movedTask] = updatedTaskList.splice(source.index, 1);
      updatedTaskList.splice(destination.index, 0, movedTask);

      const updatedColumn = {
        ...startColumn,
        taskList: updatedTaskList,
      };

      const updatedColumns = KanbanData.columnList.map((col) =>
        col.columnTitle === startColumn.columnTitle ? updatedColumn : col
      );

      setKanbanData((prev) => ({
        ...prev,
        columnList: updatedColumns,
      }));
    } else {
      // Moving between different columns
      const startTaskList = Array.from(startColumn.taskList);
      const [movedTask] = startTaskList.splice(source.index, 1);
      const finishTaskList = Array.from(finishColumn.taskList);
      finishTaskList.splice(destination.index, 0, movedTask);

      const updatedStartColumn = {
        ...startColumn,
        taskList: startTaskList,
      };
      const updatedFinishColumn = {
        ...finishColumn,
        taskList: finishTaskList,
      };

      const updatedColumns = KanbanData.columnList.map((col) =>
        col.columnTitle === startColumn.columnTitle
          ? updatedStartColumn
          : col.columnTitle === finishColumn.columnTitle
          ? updatedFinishColumn
          : col
      );

      setKanbanData((prev) => ({
        ...prev,
        columnList: updatedColumns,
      }));
    }
  };

  return (
    <SidebarWithHeader>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />
      <Stack spacing={4} p={3} bg={"primary.50"} rounded={radiusStyle}>
        <Heading as="h4" size="md">
          {PostListContent.contentTitle} #{PostListContent.contentCode}
        </Heading>
        <Flex
          as={HStack}
          minH={"80vh"}
          bg={"primary.100"}
          p={5}
          alignItems={"start"}
          justifyContent={"start"}
          overflowX="auto" // Make Flex scrollable horizontally
          whiteSpace="nowrap" // Prevent line breaks
          spacing={4}
          rounded={radiusStyle}
        >
          {PostListContent.columnList
            .sort((a, b) => a.columnPos - b.columnPos)
            .map((x) => (
              <PostColumn key={x.columnTitle} {...x} />
            ))}
        </Flex>
      </Stack>
    </SidebarWithHeader>
  );
}

const PostColumn = ({ columnTitle, taskList }: PostColumnProps) => {
  return (
    <Droppable droppableId={columnTitle}>
      {(provided) => (
        <Flex
          as={Stack}
          direction="column"
          spacing={4}
          width={{ base: "full", md: "350px" }}
          flexShrink={0}
          bg={"primary.200"}
          p={4}
          rounded={"lg"}
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <Box px={4} py={2} rounded={"lg"}>
            <Heading as="h4" size="md">
              {columnTitle}
            </Heading>
          </Box>
          {taskList
            .sort((a, b) => a.taskPos - b.taskPos)
            .map((task, index) => (
              <PostCard key={task.taskCode} task={task} index={index} />
            ))}
          {provided.placeholder}
        </Flex>
      )}
    </Droppable>
  );
};

const PostCard = ({ task, index }: { task: PostCardProps; index: number }) => {
  return (
    <Draggable draggableId={task.taskCode} index={index}>
      {(provided) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          rounded={"lg"}
          flexShrink={0}
        >
          <CardBody p={5}>
            <Heading size="sm" textTransform="uppercase">
              #{task.taskCode} - {task.taskName}
            </Heading>
            <Text pt="2" fontSize="sm">
              {task.taskDesc}
            </Text>
          </CardBody>
        </Card>
      )}
    </Draggable>
  );
};

export default KanbanPage;
