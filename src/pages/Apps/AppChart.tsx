import React from "react";
import { Bar } from "react-chartjs-2";
import { SmallTooltip } from "../../utils/chart/ExternalTooltip";
import moment from "moment";

const options = {
  layout: {
    padding: 0,
  },
  scales: {
    x: { display: false },
    y: { display: false },
  },
  plugins: {
    legend: false,
    tooltip: {
      enabled: false,
      external: SmallTooltip,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  resizeDelay: 200,
};

const getChartData = (listData) => {
  if (!listData?.length) {
    return { labels: [], datasets: [] };
  }

  return {
    labels: listData.map((el) => moment(el.date).format("ddd, MMM Do, YYYY")),
    datasets: [
      {
        label: "",
        data: listData.map((el) => el.total),
        backgroundColor: "#0369a1",
        hoverBackgroundColor: "#0284c7",
        barPercentage: 1.1,
      },
    ],
  };
};

export const AppChart = React.memo((props: any) => {
  const { data } = props;
  const chartData = getChartData(data);

  return (
    <Bar
      // @ts-ignore
      options={options}
      // @ts-ignore
      data={chartData}
    />
  );
});
