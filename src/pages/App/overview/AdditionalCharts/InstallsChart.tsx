import React from "react";
import PropTypes from "prop-types";
import {
  getBarChartSkeleton,
  getChartSkeletonOpt,
  getLineChartSkeleton,
} from "../../../../utils/chart/Chart";
import { CHART_COLORS } from "../../../../constants/constants";
import { shadeColor } from "../../../../utils/Utils";
import Loading from "../../../../utils/Loading";
import Empty from "antd/lib/empty";
import { Bar, Line } from "react-chartjs-2";
import moment from "moment";
import { BarChartConfigs } from "../CombinationChart/BarChart";
import ChartSwitcher, {
  ChartIds,
} from "../../../../partials/common/Switcher/ChartSwitcher";
import { LineChartConfigs } from "../CombinationChart/LineChart";

const emptyChart = { labels: [], datasets: [] };

const getBarChartData = (listData) => {
  const color1 = CHART_COLORS[0];
  const color2 = CHART_COLORS[1];
  const hoverColor1 = shadeColor(color1, -10);
  const hoverColor2 = shadeColor(color2, -10);

  if (!listData?.length) return emptyChart;

  const nonOrganicInfo = listData[0]?.thisPeriod?.data || [];
  const organicInfo = listData[1]?.thisPeriod?.data || [];
  const labels = organicInfo.map((data) => moment(data.date)?.format("MMM D"));

  const nonOrganicData = nonOrganicInfo.map((el) => el.total || 0);
  const organicData = organicInfo.map((el) => el.total || 0);
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

const getLineChartData = (listData) => {
  if (!listData?.length) return emptyChart;

  const nonOrganicInfo = listData[0]?.thisPeriod?.data || [];
  const organicInfo = listData[1]?.thisPeriod?.data || [];
  const labels = organicInfo.map((data) => moment(data.date)?.format("MMM D"));

  const nonOrganicData = nonOrganicInfo.map((el) => el.total || 0);
  const organicData = organicInfo.map((el) => el.total || 0);

  const datasets = [
    {
      label: "Non-organic",
      data: nonOrganicData,
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 3,
      pointBackgroundColor: CHART_COLORS[0],
      borderColor: CHART_COLORS[0],
      borderWidth: 2,
      backgroundColor: "transparent",
      clip: 20,
    },
    {
      label: "Organic",
      data: organicData,
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 3,
      pointBackgroundColor: CHART_COLORS[1],
      borderColor: CHART_COLORS[1],
      borderWidth: 2,
      backgroundColor: "transparent",
      clip: 20,
    },
  ];

  return { labels, datasets };
};

function InstallsChart(props) {
  const { isLoading, data, activedChart, setActivedChart } = props;

  let chartData;
  let options;

  if (!data?.length && isLoading) {
    options = getChartSkeletonOpt();
    if (activedChart === ChartIds.stackedBar) {
      chartData = getBarChartSkeleton();
    } else {
      chartData = getLineChartSkeleton();
    }
  } else {
    if (activedChart === ChartIds.stackedBar) {
      chartData = getBarChartData(data);
      options = BarChartConfigs;
    } else {
      chartData = getLineChartData(data);
      options = LineChartConfigs;
    }
  }

  const chartEl =
    activedChart === ChartIds.stackedBar ? (
      <Bar options={options} data={chartData} />
    ) : (
      <Line options={options} data={chartData} />
    );

  return (
    <div className="overview-section mt-3">
      <header className="section-header">
        <div className="text-base text-slate-800">User acquisition trend</div>

        <ChartSwitcher activedChart={activedChart} onChange={setActivedChart} />
      </header>

      <div className="h-[420px]">
        <div className="w-full h-full relative">
          {isLoading && <Loading isFixed={false} />}

          {!isLoading && chartData?.labels?.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <Empty />
            </div>
          )}

          {chartData?.labels?.length !== 0 && <>{chartEl}</>}
        </div>
      </div>
    </div>
  );
}

InstallsChart.propTypes = {
  isLoading: PropTypes.bool,
  data: PropTypes.array,
  activedChart: PropTypes.string,
  setActivedChart: PropTypes.func,
};

export default InstallsChart;
