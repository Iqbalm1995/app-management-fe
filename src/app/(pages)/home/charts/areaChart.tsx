import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically load the Chart component to prevent it from being imported server-side
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export interface DataSetProps {
  name: string;
  data: number[];
}

export interface AreaChartProps {
  data: DataSetProps[];
  categories: string[];
  height?: string;
}

export const AreaChart: React.FC<AreaChartProps> = ({
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
      type: "area",
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
    colors: ["#ff7400", "#0087ff", "#00ff55"], // Customize colors for different series
  };

  return isMounted ? (
    <Chart options={chartOptions} series={data} type="area" height={height} />
  ) : null;
};
