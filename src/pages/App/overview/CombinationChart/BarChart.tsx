import React from "react";
import PropTypes from "prop-types";
import { shadeColor } from "../../../../utils/Utils";
import { Bar } from "react-chartjs-2";
import Loading from "../../../../utils/Loading";
import {
  getBarChartSkeleton,
  getChartSkeletonOpt,
} from "../../../../utils/chart/Chart";
import { CHART_COLORS, CHART_OTHERS } from "../../../../constants/constants";
import { getCountryNameFromCode } from "../../../../utils/Helpers";
import Empty from "antd/lib/empty";
import { ColorTooltip } from "../../../../utils/chart/ExternalTooltip";

export const BarChartConfigs = {
  layout: {
    padding: {
      top: 12,
      bottom: 16,
      left: 20,
      right: 20,
    },
  },
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
      grid: {
        display: false,
      },
    },
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
  interaction: {
    intersect: false,
    mode: "index",
    axis: "x",
  },
  responsive: true,
  maintainAspectRatio: false,
  resizeDelay: 200,
};

const getBarChartData = (listData, isCountry) => {
  const color1 = CHART_COLORS[0];
  const color2 = CHART_COLORS[1];
  const hoverColor1 = shadeColor(color1, -10);
  const hoverColor2 = shadeColor(color2, -10);

  // const needTruncate = listData.length > 10;
  const labels = listData?.map((data, idx) => {
    const dataLabel = data.name || data.id;
    // const label = idx + "," + dataLabel;
    // const formatedLabel =
    //   needTruncate && label.length > 20 ? label.slice(0, 18) + "..." : label;
    // return formatedLabel;
    if (isCountry && dataLabel !== CHART_OTHERS) {
      return getCountryNameFromCode(dataLabel) + " (" + dataLabel + ")";
    }

    return dataLabel;
  });
  if (!labels?.length) return { labels: [], datasets: [] };

  const organicData = listData.map((el) => el.organicTotal || 0);
  const nonOrganicData = listData.map((el) => el.nonOrganicTotal || 0);
  const datasets = [
    {
      label: "Non-organic",
      data: nonOrganicData,
      backgroundColor: color1,
      hoverBackgroundColor: hoverColor1,
      maxBarThickness: 30,
    },
    {
      label: "Organic",
      data: organicData,
      backgroundColor: color2,
      hoverBackgroundColor: hoverColor2,
      maxBarThickness: 30,
    },
  ];

  return { labels, datasets };
};

function BarChart(props) {
  const { isLoading, data, isCountry } = props;

  let chartData;
  let options;

  if (!data?.length && isLoading) {
    chartData = getBarChartSkeleton();
    options = getChartSkeletonOpt();
  } else {
    chartData = getBarChartData(data, isCountry);
    options = BarChartConfigs;
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
        <Bar
          // @ts-ignore
          options={options}
          data={chartData}
        />
      )}
    </div>
  );
}

BarChart.propTypes = {
  isLoading: PropTypes.bool,
  data: PropTypes.array,
  isCountry: PropTypes.bool,
};

export default BarChart;
