import { hexToRGB, tailwindConfig } from "../Utils";

export const getChartSkeletonOpt = (isPieChart = false) => {
  const defaultPadding = { top: 40, bottom: 40, left: 30, right: 30 };
  // const padding = isPieChart ? 90 : defaultPadding;

  const options = {
    layout: { padding: defaultPadding },
    scales: {
      x: { display: false },
      y: { display: false },
    },
    plugins: {
      legend: false,
      tooltip: { enabled: false },
    },
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    resizeDelay: 200,
  };

  if (isPieChart) {
    return { ...options, events: [] };
  }

  return options;
};

export const getBarChartSkeleton = () => {
  const skeletonData = [50, 160, 120, 180, 110, 90, 170, 100, 140];
  const bg = "rgba(227, 227, 227, 0.3)";

  return {
    labels: skeletonData.map((el) => ""),
    datasets: [
      {
        label: skeletonData.map((el) => ""),
        data: skeletonData,
        backgroundColor: bg,
        hoverBackgroundColor: bg,
        barPercentage: 0.5,
        categoryPercentage: 0.15,
      },
    ],
  };
};

export const getLineChartSkeleton = () => {
  // @ts-ignore
  const color = tailwindConfig().theme.colors.slate[200];
  const fakedPoints = [382, 571, 589, 621, 420, 588, 280, 480, 534, 349, 496];

  return {
    labels: fakedPoints.map((el) => ""),
    datasets: [
      {
        label: "",
        data: fakedPoints,
        fill: true,
        // backgroundColor: "transparent",
        backgroundColor: `rgba(${hexToRGB(color)}, 0.1)`,
        borderColor: color,
        pointBackgroundColor: color,
        borderWidth: 1,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 0,
        clip: 20,
      },
    ],
  };
};

export const getPieChartSkeleton = (cutout = "60%") => {
  // @ts-ignore
  const color = tailwindConfig().theme.colors.slate[200];
  const bg = `rgba(${hexToRGB(color)}, 0.5)`;
  // const borderColor = `rgba(${hexToRGB(color)}, 0.6)`;
  // const fakedPoints = [999, 389, 181, 101, 40];
  const fakedPoints = [100];

  return {
    labels: fakedPoints.map((el) => ""),
    datasets: [
      {
        label: "",
        data: fakedPoints,
        backgroundColor: fakedPoints.map((el) => bg),
        hoverBackgroundColor: fakedPoints.map((el) => bg),
        // borderColor,
        borderWidth: 0,
        cutout,
      },
    ],
  };
};
