import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { AiOutlineLineChart } from "@react-icons/all-files/ai/AiOutlineLineChart";
import { AiOutlineTable } from "@react-icons/all-files/ai/AiOutlineTable";

function SwitchTableAndChart(props) {
  const { isTableModeView, onViewTable, onViewChart } = props;

  return (
    <div className="flex">
      <div
        onClick={onViewTable}
        className={classNames(
          "group cursor-pointer border px-3 py-1.5",
          isTableModeView ? "border-antPrimary" : "border-r-0"
        )}
      >
        <AiOutlineTable
          size={16}
          className={classNames(
            "group-hover:text-antPrimary",
            isTableModeView && "text-antPrimary"
          )}
        />
      </div>
      <div
        className={classNames(
          "group cursor-pointer border px-3 py-1.5",
          !isTableModeView ? "border-antPrimary" : "border-l-0"
        )}
        onClick={onViewChart}
      >
        <AiOutlineLineChart
          size={16}
          className={classNames(
            "group-hover:text-antPrimary",
            !isTableModeView && "text-antPrimary"
          )}
        />
      </div>
    </div>
  );
}

SwitchTableAndChart.defaultProps = {
  isTableModeView: false,
};

SwitchTableAndChart.propTypes = {
  isTableModeView: PropTypes.bool,
  onViewTable: PropTypes.func,
  onViewChart: PropTypes.func,
};

export default SwitchTableAndChart;
