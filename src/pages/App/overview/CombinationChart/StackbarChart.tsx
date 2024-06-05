import React from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import Loading from "../../../../utils/Loading";
import {
  getBarChartSkeleton,
  getChartSkeletonOpt,
} from "../../../../utils/chart/Chart";
import moment from "moment";
import { CHART_COLORS, CHART_OTHERS } from "../../../../constants/constants";
import { getCountryNameFromCode } from "../../../../utils/Helpers";
import Empty from "antd/lib/empty";
import { ColorTooltip } from "../../../../utils/chart/ExternalTooltip";

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
      backgroundColor: color,
      hoverBackgroundColor: color,
      maxBarThickness: 30,
    };
  });

  return { labels, datasets };
};

function StackbarChart(props) {
  const { isLoading, data, isCountry } = props;

  let chartData;
  let options;

  if (!data?.length && isLoading) {
    chartData = getBarChartSkeleton();
    options = getChartSkeletonOpt();
  } else {
    chartData = getBarChartData(data, isCountry);
    options = {
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

StackbarChart.propTypes = {
  isLoading: PropTypes.bool,
  data: PropTypes.array,
  isCountry: PropTypes.bool,
};

export default StackbarChart;
