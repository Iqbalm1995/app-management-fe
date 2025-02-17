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
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Kanban Example",
  breadCrumb: ["Home", "Kanban"],
};

function KanbanPage() {
  return (
    <SidebarWithHeader>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />
      <Flex
        as={HStack}
        minH={"80vh"}
        bg={"primary.50"}
        p={5}
        alignItems={"start"}
        justifyContent={"start"}
        overflowX="auto" // Make Flex scrollable horizontally
        whiteSpace="nowrap" // Prevent line breaks
        spacing={4}
        rounded={radiusStyle}
      >
        <DummyCardBoard />
        <DummyCardBoard />
        <DummyCardBoard />
      </Flex>
    </SidebarWithHeader>
  );
}

interface DummyCardProps {
  taskCode: string;
  taskName: string;
  taskDesc: string;
  taskPos: number;
}

const ListTaskCard: DummyCardProps[] = [
  {
    taskCode: "T001",
    taskName: "Task 1",
    taskDesc:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Qui adipisci perspiciatis dolorem modi harum nemo numquam molestias enim. A omnis sapiente mollitia itaque facere, molestias voluptates natus cumque ullam architecto.",
    taskPos: 1,
  },
  {
    taskCode: "T002",
    taskName: "Task 2",
    taskDesc: "Lorem ipsum dolor sit, amet consectetur adipisicing elit.",
    taskPos: 2,
  },
  {
    taskCode: "T003",
    taskName: "Task 3",
    taskDesc:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit 3. Qui adipisci perspiciatis dolorem modi harum nemo numquam molestias enim",
    taskPos: 3,
  },
];

const DummyCardBoard = () => {
  const [cards, setCards] = useState<DummyCardProps[]>(ListTaskCard);

  const moveCard = (dragIndex: number, hoverIndex: number) => {
    const draggedCard = cards[dragIndex];
    const newCards = [...cards];
    newCards.splice(dragIndex, 1);
    newCards.splice(hoverIndex, 0, draggedCard);
    setCards(newCards);
  };
  return (
    <Flex
      as={Stack}
      direction="column"
      spacing={4}
      width={{ base: "full", md: "350px" }}
      flexShrink={0}
      bg={"gray.200"}
      p={4}
    >
      <Box px={4} py={2}>
        <Heading as="h4" size="md">
          Card Board 1
        </Heading>
      </Box>
      {cards.map((task, index) => (
        <DraggableCard
          key={task.taskCode}
          index={index}
          task={task}
          moveCard={moveCard}
        />
      ))}
      <Divider />
      <Box px={4} py={2} fontSize={"xs"} overflowX="auto">
        <pre>{JSON.stringify(cards, null, 2)}</pre>
      </Box>
    </Flex>
  );
};

const DraggableCard = ({
  task,
  index,
  moveCard,
}: {
  task: DummyCardProps;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: "CARD",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "CARD",
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveCard(item.index, index);
        item.index = index;
      }
    },
  });

  // Make sure to attach the drop target and drag reference correctly
  drag(drop(ref));

  // Return the draggable card with custom styles
  return (
    <Box
      ref={ref}
      cursor="move"
      style={{
        opacity: isDragging ? 1 : 1, // Keep full opacity even when dragging
        transition: "opacity 0.2s ease", // Optional: Smooth transition
      }}
    >
      <Card rounded="lg" flexShrink={0}>
        <CardBody p={5}>
          <Heading size="sm" textTransform="uppercase">
            #{task.taskCode} - {task.taskName}
          </Heading>
          <Text pt="2" fontSize="sm" whiteSpace="normal">
            {task.taskDesc}
          </Text>
        </CardBody>
      </Card>
    </Box>
  );
};

// const DummyCard = ({ taskCode, taskName, taskDesc }: DummyCardProps) => {
//   return (
//     <Card rounded={radiusStyle} flexShrink={0}>
//       <CardBody p={5}>
//         <Heading size="sm" textTransform="uppercase">
//           #{taskCode} - {taskName}
//         </Heading>
//         <Text pt="2" fontSize="sm" whiteSpace="normal">
//           {taskDesc}
//         </Text>
//       </CardBody>
//     </Card>
//   );
// };

export default KanbanPage;
