import React from "react";
import PropTypes from "prop-types";
import { Doughnut } from "react-chartjs-2";
import Loading from "../../../../utils/Loading";
import { hexToRGB } from "../../../../utils/Utils";
import {
  getChartSkeletonOpt,
  getPieChartSkeleton,
} from "../../../../utils/chart/Chart";
import { CHART_COLORS, CHART_OTHERS } from "../../../../constants/constants";
import { getCountryNameFromCode } from "../../../../utils/Helpers";
import Empty from "antd/lib/empty";
import { ColorTooltip } from "../../../../utils/chart/ExternalTooltip";

const getBarChartData = (listData, isCountry) => {
  const labels = listData?.map((data) => {
    const dataLabel = data.name || data.id;
    if (isCountry && dataLabel !== CHART_OTHERS) {
      return getCountryNameFromCode(dataLabel) + " (" + dataLabel + ")";
    }

    return dataLabel;
  });
  if (!labels?.length) return { labels: [], datasets: [] };

  let backgroundColor: string[] = [];
  let borderColor: string[] = [];
  let hoverBackgroundColor: string[] = [];

  listData.forEach((el, idx) => {
    const maxColor = CHART_COLORS.length;
    const colorIdx = idx < maxColor ? idx : idx % maxColor;
    const color = CHART_COLORS[colorIdx];

    backgroundColor.push(color);
    borderColor.push(`rgba(${hexToRGB(color)}, 0.2)`);
    hoverBackgroundColor.push(`rgba(${hexToRGB(color)}, 0.8)`);
  });

  const datasetData = listData.map((el) => el.total);
  const datasets = [
    {
      label: "Total",
      data: datasetData,
      backgroundColor,
      hoverBackgroundColor,
      borderColor,
      borderWidth: 1,
      hoverOffset: 0,
      cutout: "60%",
    },
  ];

  return { labels, datasets };
};

function PieChart(props) {
  const { isLoading, data, isCountry } = props;

  let chartData;
  let options;

  if (!data?.length && isLoading) {
    chartData = getPieChartSkeleton();
    options = getChartSkeletonOpt();
  } else {
    chartData = getBarChartData(data, isCountry);
    options = {
      layout: {
        padding: 20,
      },
      plugins: {
        tooltip: {
          enabled: false,
          external: ColorTooltip,
        },
        legend: {
          position: "bottom",
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 200,
    };
  }

  return (
    <div className="w-full h-full relative">
      {isLoading && <Loading isFixed={false} />}

      {!isLoading && chartData?.labels?.length === 0 && (
        <div className="h-full flex items-center justify-center">
          <Empty />
        </div>
      )}

      {chartData?.labels?.length !== 0 && (
        <Doughnut
          // @ts-ignore
          options={options}
          data={chartData}
        />
      )}
    </div>
  );
}

PieChart.propTypes = {
  isLoading: PropTypes.bool,
  data: PropTypes.array,
  isCountry: PropTypes.bool,
};

export default PieChart;
