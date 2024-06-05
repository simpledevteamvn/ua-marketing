import React from "react";
import PropTypes from "prop-types";
import Loading from "../../../../utils/Loading";
import Empty from "antd/lib/empty";
import { Line } from "react-chartjs-2";
import {
  getChartSkeletonOpt,
  getLineChartSkeleton,
} from "../../../../utils/chart/Chart";
import { LineChartConfigs } from "../CombinationChart/LineChart";
import moment from "moment";
import { CHART_COLORS } from "../../../../constants/constants";
import Dropdown from "antd/lib/dropdown";
import { ListCharts, TouchpointsChartKey } from "../constant";

const getLineChartData = (listData, isGetRate = false) => {
  if (!listData?.length) return { labels: [], datasets: [] };

  const getLabels = (list) =>
    list.map((data) => moment(data.date)?.format("MMM D"));

  if (isGetRate) {
    const clickToInstall = listData[2]?.thisPeriod?.data || [];
    const labels = getLabels(clickToInstall);
    const datasets = [
      {
        label: "Click-to-install rate",
        data: clickToInstall.map((el) => el.total || 0),
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: CHART_COLORS[4],
        borderColor: CHART_COLORS[4],
        borderWidth: 2,
        backgroundColor: "transparent",
        clip: 20,
      },
    ];

    return { labels, datasets };
  }

  const installInfo = listData[0]?.thisPeriod?.data || [];
  const impressionInfo = listData[1]?.thisPeriod?.data || [];
  const labels = getLabels(impressionInfo);

  const installData = installInfo.map((el) => el.total || 0);
  const impressionData = impressionInfo.map((el) => el.total || 0);

  const datasets = [
    {
      label: "Installs",
      data: installData,
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 3,
      pointBackgroundColor: "#51cf66",
      borderColor: "#51cf66",
      borderWidth: 2,
      backgroundColor: "transparent",
      clip: 20,
    },
    {
      label: "Impressions",
      data: impressionData,
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      pointHoverRadius: 3,
      pointBackgroundColor: "#1d86df", // 339af0
      borderColor: "#1d86df",
      borderWidth: 2,
      backgroundColor: "transparent",
      clip: 20,
    },
  ];

  return { labels, datasets };
};

function ClickToInstallChart(props) {
  const { isLoading, data, activedChart, setActivedChart } = props;

  let chartData;
  let options;

  if (!data?.length && isLoading) {
    chartData = getLineChartSkeleton();
    options = getChartSkeletonOpt();
  } else {
    options = LineChartConfigs;
    if (activedChart === TouchpointsChartKey) {
      chartData = getLineChartData(data);
    } else {
      chartData = getLineChartData(data, true);
    }
  }

  const activedChartName = ListCharts.find(
    (el) => el.key === activedChart
  )?.label;

  return (
    <div className="overview-section mt-3 mb-3">
      <header className="section-header">
        <div className="flex items-center space-x-2">
          <div>Show</div>
          <Dropdown
            menu={{
              selectable: true,
              selectedKeys: [activedChart],
              items: ListCharts,
              onClick: (item) => setActivedChart(item.key),
            }}
            trigger={["click"]}
          >
            <button className="custom-btn-light">{activedChartName}</button>
          </Dropdown>
        </div>
      </header>

      <div className="h-[420px]">
        <div className="w-full h-full relative">
          {isLoading && <Loading isFixed={false} />}

          {!isLoading && chartData?.labels?.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <Empty />
            </div>
          )}

          {chartData?.labels?.length !== 0 && (
            <Line options={options} data={chartData} />
          )}
        </div>
      </div>
    </div>
  );
}

ClickToInstallChart.propTypes = {
  isLoading: PropTypes.bool,
  data: PropTypes.array,
  activedChart: PropTypes.string,
  setActivedChart: PropTypes.func,
};

export default ClickToInstallChart;
