import { Flex, HStack, Stack, Text } from "@chakra-ui/react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { DataUserProgressProps, StackCardProgress } from "./stackCardProgress";
import { radiusStyle } from "@/app/constants/applicationConstants";

// Dynamically load the Chart component to prevent it from being imported server-side
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const thresholdColor = "#ee0000";
const normalColor = "#0077fe";

export const PersonalChartProgrss = ({ dt }: { dt: DataUserProgressProps }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate percentage, clamp to 0–100
  const percent = Number(((dt.progress / dt.max) * 100).toFixed(2));
  const isOverThreshold = dt.progress > dt.max;

  const chartOptions: ApexOptions = {
    chart: {
      type: "radialBar",
      sparkline: {
        enabled: true,
      },
    },

    plotOptions: {
      radialBar: {
        hollow: {
          size: "60%",
        },
        track: {
          background: "#f0f0f0",
        },
        dataLabels: {
          show: true,
        },
      },
    },
    stroke: {
      lineCap: "round",
    },
    colors: [isOverThreshold ? thresholdColor : normalColor],
    labels: [`${dt.progress}/${dt.max} Mandays`],
  };

  return (
    <Flex w={"full"} as={Stack}>
      <Flex w={"full"} h={"250px"} justifyContent={"center"}>
        {isMounted ? (
          <Chart
            options={chartOptions}
            series={[percent]}
            type="radialBar"
            height="100%"
            width="100%"
          />
        ) : (
          <></>
        )}
      </Flex>
      <Flex
        as={HStack}
        spacing={10}
        bgGradient={"linear(to-br, secondary.500, secondary.500)"}
        py={4}
        rounded={radiusStyle}
        color={"white"}
        boxShadow={"md"}
        justifyContent={"space-between"}
        px={5}
      >
        <Flex as={Stack} spacing={1}>
          <Text fontSize={"small"} fontWeight={500} textAlign={"center"}>
            Pending
          </Text>
          <Text fontSize={"2xl"} fontWeight={600} textAlign={"center"}>
            112
          </Text>
        </Flex>
        <Flex as={Stack} spacing={1}>
          <Text fontSize={"small"} fontWeight={500} textAlign={"center"}>
            OnProgress
          </Text>
          <Text fontSize={"2xl"} fontWeight={600} textAlign={"center"}>
            4
          </Text>
        </Flex>
        <Flex as={Stack} spacing={1}>
          <Text fontSize={"small"} fontWeight={500} textAlign={"center"}>
            Done
          </Text>
          <Text fontSize={"2xl"} fontWeight={600} textAlign={"center"}>
            53
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};
