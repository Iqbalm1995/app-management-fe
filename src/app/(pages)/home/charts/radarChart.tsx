import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically load the Chart component to prevent it from being imported server-side
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export interface AreaDataSetProps {
  name: string;
  data: number[];
}

export interface RadarChartProps {
  data: AreaDataSetProps[];
  categories: string[];
  height?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  categories,
  height = "380px",
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartOptions: ApexOptions = {
    chart: {
      // id: "area-chart",
      type: "radar",
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories,
    },
    stroke: {
      curve: "smooth",
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 90, 100],
      },
    },
    colors: ["#0087ff", "#00ff55", "#ff7400", ], // Customize colors for different series
  };

  return isMounted ? (
    <Chart options={chartOptions} series={data} type="radar" height={height} />
  ) : null;
};
