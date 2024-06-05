import React from "react";
import { AiOutlineCaretDown } from "@react-icons/all-files/ai/AiOutlineCaretDown";
import { AiOutlineCaretUp } from "@react-icons/all-files/ai/AiOutlineCaretUp";
import classNames from "classnames";
import Tooltip from "antd/es/tooltip";
import { numberWithCommas } from "../../utils/Utils";

function CompareTwoNumber(num, preNum, hasBg = false, tooltip = false) {
  if (!preNum) return <></>;

  let isDesc = preNum > num ? true : false;
  const perStat = Math.round(Math.abs(1 - num / preNum) * 1000) / 10;

  if (hasBg) {
    const preEl = isDesc ? "-" : "+";
    const content = (
      <div
        className={classNames(
          "text-xxs font-semibold text-white px-1 rounded-full",
          isDesc ? "bg-red-400" : "bg-green-500"
        )}
      >
        <div className="flex items-center">
          {preEl}
          {perStat}%
        </div>
      </div>
    );

    if (tooltip) {
      return (
        <Tooltip
          title={`Before: ${numberWithCommas(
            preNum
          )} - After ${numberWithCommas(num)}`}
          color="white"
          overlayClassName="tooltip-light"
        >
          {content}
        </Tooltip>
      );
    }

    return content;
  }

  return (
    <div className="flex items-center">
      {isDesc ? (
        <AiOutlineCaretDown size={16} className="text-red-400" />
      ) : (
        <AiOutlineCaretUp size={16} className="text-green-500" />
      )}
      {perStat}%
    </div>
  );
}

export default CompareTwoNumber;
