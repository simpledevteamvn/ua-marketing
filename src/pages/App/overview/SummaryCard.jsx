import React from "react";
import PropTypes from "prop-types";

import {
  tailwindConfig,
  hexToRGB,
  numberWithCommas,
} from "../../../utils/Utils";
import { externalTooltipHandler } from "../../../utils/chart/ExternalTooltip";
import { Line } from "react-chartjs-2";
import Skeleton from "antd/lib/skeleton/Skeleton";
import Loading from "../../../utils/Loading";

function SummaryCard(props) {
  const {
    width,
    height,
    labels,
    thisPeriod,
    lastPeriod,
    total,
    daily,
    volatility,
    isLoading,
    isUpdateStats,
    dataObj,
  } = props;

  const { prefix, suffix, name, isHideDaily } = dataObj;

  // @ts-ignore
  const color1 = tailwindConfig().theme.colors.indigo[500];
  // @ts-ignore
  const color2 = tailwindConfig().theme.colors.slate[300];

  const chartData = {
    labels,
    datasets: [
      // Indigo line
      {
        data: thisPeriod,
        fill: true,
        backgroundColor: `rgba(${hexToRGB(
          // @ts-ignore
          tailwindConfig().theme.colors.blue[500]
        )}, 0.08)`,
        borderColor: color1,
        borderWidth: 2,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: color1,
        clip: 20,
      },
      // Gray line
      {
        data: lastPeriod,
        borderColor: color2,
        borderWidth: 2,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: color2,
        clip: 20,
      },
    ],
  };

  const options = {
    chartArea: {
      // @ts-ignore
      backgroundColor: tailwindConfig().theme.colors.slate[50],
    },
    layout: {
      padding: 20,
    },
    scales: {
      y: {
        display: false,
        beginAtZero: true,
      },
      x: {
        type: "time",
        time: {
          parser: "DD-MM-YYYY",
          unit: "day",
        },
        display: false,
      },
    },
    plugins: {
      tooltip: {
        enabled: false,
        external: (context) =>
          externalTooltipHandler(context, labels.length, prefix, suffix),
      },
      legend: {
        display: false,
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    animation: false,
    maintainAspectRatio: false,
    resizeDelay: 200,
  };

  return (
    <div className="relative flex flex-col col-span-full sm:col-span-6 md:col-span-4 xl:col-span-3 bg-white shadow-lg rounded-sm border border-slate-200">
      <div className="px-5 pt-5">
        {!isLoading ? (
          <>
            {isUpdateStats && <Loading isFixed={false} />}
            <h2 className="text-xl font-semibold text-slate-800">{name}</h2>
            <div className="flex items-start mt-2">
              <div className="text-base text-slate-800 mr-2">
                <span className="text-sm text-slate-400 mr-2">Total</span>
                <span className="font-bold">
                  {prefix}
                  {numberWithCommas(total)}
                  {suffix}
                </span>
              </div>
              {volatility}
            </div>
            {!isHideDaily && (
              <div>
                <div className="flex items-start mt-2">
                  <div className="text-base text-slate-800 mr-2">
                    <span className="text-sm text-slate-400 mr-2">Daily</span>
                    <span className="font-semibold">
                      {prefix}
                      {numberWithCommas(daily)}
                      {suffix}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <Skeleton paragraph={{ rows: 2 }} active />
        )}
      </div>

      <div className="grow">
        <Line
          // @ts-ignore
          options={options}
          data={chartData}
          width={width}
          height={height}
        />
      </div>
    </div>
  );
}

SummaryCard.defaultProps = {
  width: 389,
  height: 110,
  labels: [],
  thisPeriod: [],
  lastPeriod: [],
  name: "",
  total: 0,
  daily: 0,
  prefix: "",
};

SummaryCard.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  isLoading: PropTypes.bool,
  isUpdateStats: PropTypes.bool,
  labels: PropTypes.array,
  thisPeriod: PropTypes.array,
  lastPeriod: PropTypes.array,
  total: PropTypes.number,
  daily: PropTypes.number,
  volatility: PropTypes.node,
  dataObj: PropTypes.object,
};

export default SummaryCard;
