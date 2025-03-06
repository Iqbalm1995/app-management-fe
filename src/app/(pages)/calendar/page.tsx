"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import SidebarWithHeader from "@/app/components/sidebar";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { formatDateToDDMMYYYY, stringToDate } from "@/app/helper/MasterHelper";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  HStack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
// import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import momentPlugin from "@fullcalendar/moment"; // For timezone handling

import dynamic from "next/dynamic";
import { FaCircle } from "react-icons/fa6";
import { EventContentArg } from "@fullcalendar/core/index.js";
import { EventImpl } from "@fullcalendar/core/internal";
import LayoutAdmin from "@/app/components/layoutAdmin";

// Dynamically load FullCalendar with no SSR
const FullCalendar = dynamic(() => import("@fullcalendar/react"), {
  ssr: false,
});

const HeaderDataContent: HeaderContentProps = {
  titleName: "Calendar",
  breadCrumb: ["Home", "Calendar"],
};

interface EventInterface {
  title: string;
  start: string; // ISO date string format
  end?: string; // Optional end time
  allDay?: boolean; // Optional flag for all-day events
  [key: string]: any; // For any additional properties like `id`, `description`, etc.
  color?: string;
}

function CalendarPage() {
  const [events, setEvents] = useState<EventInterface[]>([]);

  useEffect(() => {
    // Simulating an API call to fetch events
    const fetchEvents = async () => {
      const fetchedEvents: EventInterface[] = [
        {
          title: "Meeting",
          start: "2025-02-21T13:00:00",
          end: "2025-02-21T14:00:00",
          color: "blue.500",
        },
        {
          title: "Conference",
          start: "2025-02-22T10:00:00",
          allDay: true,
          color: "green.500",
        },
        {
          title: "Workshop",
          start: "2025-02-23T09:00:00",
          end: "2025-02-23T12:00:00",
          color: "orange.400",
        },
        {
          title: "Yapping",
          start: "2025-02-23T13:00:00",
          end: "2025-03-05T14:00:00",
          color: "red.500",
        },
      ];
      setEvents(fetchedEvents);
    };

    fetchEvents();
  }, []);

  const handleDateClick = (arg: EventImpl) => {
    // alert("Date clicked: " + arg.dateStr);
    console.log(arg);
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />
      <Card rounded={radiusStyle}>
        <CardBody>
          <Box p={4} bg="white" shadow="md" rounded="lg">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              timeZone="Asia/Jakarta"
              locale="id"
              height="auto"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              eventContent={(eventInfo) => {
                // Check if the event spans multiple days
                const isMultiDayEvent =
                  eventInfo.event.start !== eventInfo.event.end;
                return (
                  <Flex
                    bg={eventInfo.event.backgroundColor}
                    color={"white"}
                    p={1}
                    // m={1}
                    rounded={radiusStyle}
                    fontSize={"sm"}
                    boxShadow={"md"}
                    w={"full"}
                    h={"full"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    as={HStack}
                    cursor={"pointer"}
                    onClick={() => handleDateClick(eventInfo.event)}
                    // Ensure multi-day event doesn't split into multiple color blocks
                    style={{
                      backgroundImage: isMultiDayEvent ? "" : "",
                    }}
                  >
                    <FaCircle size={8} />
                    {/* Render the event title */}
                    <Text fontWeight="bold">{eventInfo.event.title}</Text>
                    {/* <pre>{JSON.stringify(eventInfo.event.start, null, 2)}</pre> */}
                  </Flex>
                );
              }}
              dayCellContent={(dayCellInfo) => (
                <Text color="gray.600" fontWeight="bold" textAlign="center">
                  {dayCellInfo.dayNumberText}
                </Text>
              )}
              views={{
                dayGridMonth: {
                  titleFormat: { year: "numeric", month: "long" }, // Format title
                  dayHeaderFormat: { weekday: "short" }, // Format week day names
                },
              }}
              buttonText={{
                today: "Today",
                month: "Month",
                week: "Week",
                day: "Day",
              }}
            />
          </Box>
        </CardBody>
      </Card>
    </LayoutAdmin>
  );
}

export default CalendarPage;
