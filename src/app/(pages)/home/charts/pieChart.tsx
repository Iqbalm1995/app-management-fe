import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically load the Chart component to prevent it from being imported server-side
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export interface PieChartProps {
  data: number[];
  labels: string[];
}

export const PieChart: React.FC<PieChartProps> = ({ data, labels }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartOptions: ApexOptions = {
    chart: {
      type: "donut",
    },
    labels, // The labels for the pie chart (e.g., "Maker", "Approver", "Releasher")
    responsive: [
      {
        // breakpoint: 480,
        options: {
          // chart: {
          //   width: 300,
          // },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    colors: ["#0077fe", "#E53E3E", "#FFC300"], // Customize colors for each slice
  };

  return isMounted ? (
    <Chart options={chartOptions} series={data} type="donut" height={350} />
  ) : null;
};
