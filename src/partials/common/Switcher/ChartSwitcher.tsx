import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import PieChartOutlined from "@ant-design/icons/lib/icons/PieChartOutlined";

export const ChartIds = {
  pie: "pie",
  bar: "bar",
  stackedBar: "stacked_bar",
  line: "line",
};

export const BarIcon = ({ isActive = false, classNames = "" }) => (
  <svg
    className={classNames}
    focusable="false"
    viewBox="0 0 24 24"
    aria-hidden="true"
    data-qa-id="svg-icon"
    fill={isActive ? "#1890ff" : ""}
  >
    <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"></path>
  </svg>
);

export const StackBarIcon = ({ isActive = false, classNames = "" }) => (
  <svg
    className={classNames}
    focusable="false"
    viewBox="0 0 24 24"
    aria-hidden="true"
    data-qa-id="svg-icon"
    fill={isActive ? "#1890ff" : ""}
  >
    <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"></path>
  </svg>
);

export const LineIcon = ({ isActive = false, classNames = "" }) => (
  <svg
    className={classNames}
    focusable="false"
    viewBox="0 0 24 24"
    aria-hidden="true"
    data-qa-id="svg-icon"
    fill={isActive ? "#1890ff" : ""}
  >
    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"></path>
  </svg>
);

function ChartSwitcher(props) {
  const { activedChart, onChange, listChart } = props;

  return (
    <div className="flex">
      {listChart.length > 0 &&
        listChart.map((chartId, idx) => {
          const iconClass = "w-5 h-full";
          let icon;

          switch (chartId) {
            case ChartIds.bar:
              icon = (
                <BarIcon
                  classNames={iconClass}
                  isActive={activedChart === ChartIds.bar}
                />
              );
              break;
            case ChartIds.stackedBar:
              icon = (
                <StackBarIcon
                  classNames={iconClass}
                  isActive={activedChart === ChartIds.stackedBar}
                />
              );
              break;
            case ChartIds.line:
              icon = (
                <LineIcon
                  classNames={iconClass}
                  isActive={activedChart === ChartIds.line}
                />
              );
              break;

            default:
              icon = (
                <PieChartOutlined
                  className={classNames(
                    "w-5",
                    activedChart === ChartIds.pie && "!text-antPrimary"
                  )}
                />
              );
              break;
          }

          return (
            <div
              key={idx}
              onClick={() => onChange(chartId)}
              className={classNames(
                "cursor-pointer border px-2.5 py-[5px] ",
                chartId === ChartIds.pie && "pt-[8px]",
                activedChart === chartId && "border-antPrimary ",
                activedChart !== chartId && idx && "border-l-transparent",
                idx === listChart.length - 1 && "rounded-r-sm",
                !idx && "rounded-l-sm"
              )}
            >
              {icon}
            </div>
          );
        })}
    </div>
  );
}

ChartSwitcher.defaultProps = {
  listChart: [ChartIds.stackedBar, ChartIds.line],
};

ChartSwitcher.propTypes = {
  activedChart: PropTypes.string,
  onChange: PropTypes.func,
  listChart: PropTypes.array,
};

export default ChartSwitcher;
