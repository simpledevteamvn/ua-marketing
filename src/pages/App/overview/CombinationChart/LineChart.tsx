import React from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import { ColorTooltip } from "../../../../utils/chart/ExternalTooltip";
import Loading from "../../../../utils/Loading";
import {
  getLineChartSkeleton,
  getChartSkeletonOpt,
} from "../../../../utils/chart/Chart";
import moment from "moment";
import { CHART_COLORS, CHART_OTHERS } from "../../../../constants/constants";
import { getCountryNameFromCode } from "../../../../utils/Helpers";
import Empty from "antd/lib/empty";

export const LineChartConfigs = {
  layout: {
    padding: {
      top: 15,
      bottom: 20,
      left: 25,
      right: 25,
    },
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false,
      },
    },
    y: {
      display: true,
      grid: {
        display: false,
      },
    },
  },
  plugins: {
    tooltip: {
      enabled: false,
      external: (context) => ColorTooltip(context, "line"),
    },
    legend: {
      position: "bottom",
    },
  },
  interaction: {
    intersect: false,
    mode: "index",
  },
  responsive: true,
  maintainAspectRatio: false,
  resizeDelay: 200,
};

const getBarChartData = (listData, isCountry) => {
  const labels = listData?.[0]?.data.map((el) =>
    moment(el.date)?.format("MMM D")
  );

  if (!labels?.length) return { labels: [], datasets: [] };

  const datasets = listData.map((el, idx) => {
    const maxColor = CHART_COLORS.length;
    const colorIdx = idx < maxColor ? idx : idx % maxColor;
    const color = CHART_COLORS[colorIdx];
    const dataLabel = el.name || el.id;

    let label = dataLabel;
    if (isCountry && dataLabel !== CHART_OTHERS) {
      label = getCountryNameFromCode(dataLabel) + " (" + dataLabel + ")";
    }

    return {
      label,
      data: el.data.map((el) => el.total || 0),
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 3,
      pointBackgroundColor: color,
      borderColor: color,
      borderWidth: 2,
      backgroundColor: "transparent",
      clip: 20,
    };
  });

  return { labels, datasets };
};

function LineChart(props) {
  const { isLoading, data, isCountry } = props;

  let chartData;
  let options;

  if (!data?.length && isLoading) {
    chartData = getLineChartSkeleton();
    options = getChartSkeletonOpt();
  } else {
    chartData = getBarChartData(data, isCountry);
    options = LineChartConfigs;
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
        <Line
          // @ts-ignore
          options={options}
          data={chartData}
        />
      )}
    </div>
  );
}

LineChart.propTypes = {
  isLoading: PropTypes.bool,
  data: PropTypes.array,
  isCountry: PropTypes.bool,
};

export default LineChart;
