import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically load the Chart component to prevent it from being imported server-side
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export interface RadialChartProps {
  progress: number; // Current value
  max: number; // Maximum value
  strokeWidth?: number; // Line width/thickness
  thresholdColor?: string; // Optional color if threshold exceeded (default red)
  normalColor?: string; // Optional base color (default blue)
}

export const RadialBar: React.FC<RadialChartProps> = ({
  progress,
  max,
  strokeWidth = 10,
  thresholdColor = "#ee0000",
  normalColor = "#0077fe",
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate percentage, clamp to 0–100
  const percent = Math.min(Math.max((progress / max) * 100, 0), 100);
  const isOverThreshold = progress > max;

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
          size: "40%",
        },
        track: {
          background: "#f0f0f0",
        },
        dataLabels: {
          show: false,
        },
      },
    },
    stroke: {
      lineCap: "round",
    },
    colors: [isOverThreshold ? thresholdColor : normalColor],
    labels: [],
  };

  return isMounted ? (
    <Chart
      options={chartOptions}
      series={[percent]}
      type="radialBar"
      height="100%"
      width="100%"
    />
  ) : null;
};